import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ChatService, ChatSession, ChatStatus, ChatType, MessageSenderType, ChatHubMessage } from '../../services/chat.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-conversations',
  standalone: false,
  templateUrl: './conversations.component.html',
  styleUrl: './conversations.component.css',
})
export class ConversationsComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  role: string | null = null;
  isMonitor = false;
  sessions: ChatSession[] = [];
  currentSession: ChatSession | null = null;
  newMessage = '';
  isLoading = false;
  isConnected = false;
  search = '';

  MessageSenderType = MessageSenderType;
  ChatStatus = ChatStatus;
  ChatType = ChatType;

  private destroy$ = new Subject<void>();
  private shouldScroll = false;

  constructor(
    private chatService: ChatService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    public i18n: I18nService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  async ngOnInit(): Promise<void> {
    this.role = this.authService.getRole();
    this.isMonitor = this.role === 'Admin' || this.role === 'CustomerService';

    try {
      await this.chatService.startConnection();
    } catch { }

    this.subscribeEvents();
    this.load();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.currentSession) this.chatService.leaveSession(this.currentSession.id);
    this.chatService.stopConnection();
  }

  private subscribeEvents(): void {
    this.chatService.connectionStatus.pipe(takeUntil(this.destroy$)).subscribe(status => {
      this.ngZone.run(() => { this.isConnected = status; this.cdr.detectChanges(); });
    });

    this.chatService.onMessageReceived.pipe(takeUntil(this.destroy$)).subscribe((msg: ChatHubMessage) => {
      this.ngZone.run(() => {
        if (this.currentSession && msg.sessionId === this.currentSession.id) {
          this.currentSession.messages.push({
            id: msg.messageId,
            sessionId: msg.sessionId,
            senderName: msg.senderName,
            content: msg.content,
            senderType: msg.senderType,
            isRead: false,
            createdAt: new Date(msg.createdAt)
          });
          this.shouldScroll = true;
        }
        const s = this.sessions.find(s => s.id === msg.sessionId);
        if (s) s.lastMessageAt = new Date(msg.createdAt);
        this.cdr.detectChanges();
      });
    });
  }

  load(): void {
    this.isLoading = true;
    const call = this.isMonitor
      ? this.chatService.getAllCustomerVendorChats()
      : this.chatService.getVendorChats();
    call.subscribe({
      next: (res: any) => {
        if (res.success) this.sessions = res.data || [];
        this.isLoading = false;
        this.autoOpenFromQuery();
        this.cdr.detectChanges();
      },
      error: () => { this.isLoading = false; this.cdr.detectChanges(); }
    });
  }

  private autoOpenFromQuery(): void {
    const sid = parseInt(this.route.snapshot.queryParamMap.get('sessionId') || '', 10);
    if (!sid) return;
    const s = this.sessions.find(x => x.id === sid);
    if (s) this.select(s);
  }

  get filtered(): ChatSession[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.sessions;
    return this.sessions.filter(s =>
      (s.customerName || '').toLowerCase().includes(q) ||
      ((s as any).vendorName || '').toLowerCase().includes(q) ||
      (s.sessionCode || '').toLowerCase().includes(q)
    );
  }

  async select(s: ChatSession): Promise<void> {
    if (this.currentSession?.id === s.id) return;
    if (this.currentSession) await this.chatService.leaveSession(this.currentSession.id);

    this.chatService.getSession(s.id).subscribe({
      next: async (res: any) => {
        if (res.success) {
          this.currentSession = res.data;
          this.shouldScroll = true;
          try { await this.chatService.joinSession(s.id); } catch { }
          this.cdr.detectChanges();
        }
      }
    });
  }

  async send(): Promise<void> {
    if (!this.newMessage.trim() || !this.currentSession) return;
    const content = this.newMessage.trim();
    this.newMessage = '';
    try {
      await this.chatService.sendMessage(this.currentSession.id, content);
      this.shouldScroll = true;
    } catch {
      this.toastr.error(this.i18n.currentLang === 'ar' ? 'حدث خطأ في الإرسال' : 'Error sending');
    }
  }

  onKey(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.send();
    }
  }

  isMyMessage(m: any): boolean {
    if (this.role === 'Vendor') return m.senderType === MessageSenderType.Vendor;
    if (this.isMonitor) return m.senderType === MessageSenderType.Agent;
    return false;
  }

  otherPartyName(s: ChatSession): string {
    if (this.role === 'Vendor') return s.customerName || 'عميل';
    // monitor: show both parties
    const vName = (s as any).vendorName || 'التاجر';
    return `${s.customerName || 'عميل'} ↔ ${vName}`;
  }

  formatTime(d: Date | string): string {
    return new Date(d).toLocaleTimeString(this.i18n.currentLang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  }

  private scrollBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch { }
  }

  senderLabel(m: any, s: ChatSession | null): string {
    if (!s) return '';
    switch (m.senderType) {
      case MessageSenderType.Customer: return s.customerName || 'عميل';
      case MessageSenderType.Vendor: return (s as any).vendorName || 'التاجر';
      case MessageSenderType.Agent: return m.senderName || 'الدعم';
      default: return m.senderName || '';
    }
  }
}
