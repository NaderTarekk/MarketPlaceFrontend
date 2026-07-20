// agent-dashboard.component.ts
import { ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatHubMessage, ChatMessage, ChatService, ChatSession, ChatStatus, ChatType, MessageSenderType } from '../../services/chat.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-agent-dashboard',
  standalone: false,
  templateUrl: './agent-dashboard.component.html',
  styleUrl: './agent-dashboard.component.css',
})
export class AgentDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  waitingSessions: ChatSession[] = [];
  activeSessions: ChatSession[] = [];
  currentSession: ChatSession | null = null;
  newMessage = '';
  customerTyping = false;
  isConnected = false;
  isLoading = false;

  ChatStatus = ChatStatus;
  MessageSenderType = MessageSenderType;

  private destroy$ = new Subject<void>();

  private pendingSessionId: number | null = null;

  // Transfer
  showTransferModal = false;
  transferAgents: any[] = [];
  transferSearch = '';
  transferSelectedAgentId: string | null = null;
  isTransferring = false;

  constructor(private chatService: ChatService, private cdr: ChangeDetectorRef,
    private ngZone: NgZone, private route: ActivatedRoute) { }

  openTransferModal(): void {
    this.showTransferModal = true;
    this.transferSelectedAgentId = null;
    this.transferSearch = '';
    if (this.transferAgents.length === 0) {
      this.chatService.getCsAgents().subscribe({
        next: (res: any) => {
          if (res.success) this.transferAgents = res.data || [];
          this.cdr.detectChanges();
        }
      });
    }
  }

  closeTransferModal(): void {
    this.showTransferModal = false;
    this.transferSelectedAgentId = null;
  }

  get filteredTransferAgents() {
    const q = (this.transferSearch || '').trim().toLowerCase();
    // exclude self
    const currentId = this.currentSession?.agentId as any;
    return this.transferAgents.filter(a => {
      if (a.id === currentId) return false;
      if (!q) return true;
      return (a.fullName || '').toLowerCase().includes(q) ||
             (a.email || '').toLowerCase().includes(q) ||
             (a.departmentNames || []).some((n: string) => (n || '').toLowerCase().includes(q));
    });
  }

  doTransfer(): void {
    if (!this.currentSession || !this.transferSelectedAgentId || this.isTransferring) return;
    this.isTransferring = true;
    this.chatService.transferSession(this.currentSession.id, this.transferSelectedAgentId).subscribe({
      next: (res: any) => {
        this.isTransferring = false;
        if (res.success) {
          // remove from active list (no longer belongs to me)
          this.activeSessions = this.activeSessions.filter(s => s.id !== this.currentSession!.id);
          this.currentSession = null;
          this.closeTransferModal();
        }
        this.cdr.detectChanges();
      },
      error: () => { this.isTransferring = false; this.cdr.detectChanges(); }
    });
  }

  async ngOnInit(): Promise<void> {
    this.isLoading = true;
    const sid = this.route.snapshot.queryParamMap.get('sessionId');
    if (sid) this.pendingSessionId = parseInt(sid, 10);
    await this.chatService.startConnection();

    this.chatService.connectionStatus
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.isConnected = status;
        if (status) {
          this.chatService.joinAgentsRoom();
          this.loadSessions();
        }
      });

    this.subscribeToEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.chatService.stopConnection();
  }

  private subscribeToEvents(): void {
    this.chatService.connectionStatus
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.ngZone.run(() => {
          this.isConnected = status;
          if (status) {
            this.chatService.joinAgentsRoom();
            this.loadSessions();
          }
          this.cdr.detectChanges();
        });
      });

    this.chatService.onMessageReceived
      .pipe(takeUntil(this.destroy$))
      .subscribe((msg: ChatHubMessage) => {
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
            this.scrollToBottom();
          }

          const session = this.activeSessions.find(s => s.id === msg.sessionId);
          if (session) {
            session.lastMessageAt = new Date(msg.createdAt);
          }
          this.cdr.detectChanges();
        });
      });

    this.chatService.onUserTyping
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.ngZone.run(() => {
          this.customerTyping = true;
          this.cdr.detectChanges();
          setTimeout(() => {
            this.customerTyping = false;
            this.cdr.detectChanges();
          }, 3000);
        });
      });

    this.chatService.onSessionClosed
      .pipe(takeUntil(this.destroy$))
      .subscribe((sessionId: number) => {
        this.ngZone.run(() => {
          this.activeSessions = this.activeSessions.filter(s => s.id !== sessionId);
          if (this.currentSession?.id === sessionId) {
            this.currentSession = null;
          }
          this.cdr.detectChanges();
        });
      });

    // ✅ أضف ده - للمحادثات الجديدة
    this.chatService.onWaitingSessionsUpdate
      .pipe(takeUntil(this.destroy$))
      .subscribe((sessions: ChatSession[]) => {
        this.ngZone.run(() => {
          this.waitingSessions = sessions;
          this.cdr.detectChanges();
        });
      });
  }

  private loadSessions(): void {
    this.isLoading = true;
    // المحادثات المنتظرة
    this.chatService.getWaitingSessions().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.waitingSessions = res.data;
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      }
    });

    // محادثاتي النشطة
    this.chatService.getMySessions().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.activeSessions = res.data.filter(
            (s: ChatSession) => s.status === ChatStatus.Active
          );
          this.cdr.detectChanges();
          this.isLoading = false;

          if (this.pendingSessionId) {
            const target = this.activeSessions.find(s => s.id === this.pendingSessionId);
            if (target) {
              this.selectSession(target);
              this.pendingSessionId = null;
            }
          }
        }
      }
    });
  }

  async joinSession(session: ChatSession): Promise<void> {
    try {
      await this.chatService.agentJoinSession(session.id);

      // ✅ انتظر الـ API يرجع الـ session الكامل
      this.chatService.getSession(session.id).subscribe({
        next: async (res: any) => {
          if (res.success) {
            // ✅ شيل من الـ waiting
            this.waitingSessions = this.waitingSessions.filter(s => s.id !== session.id);

            // ✅ أضف للـ active
            this.activeSessions.unshift(res.data);

            // ✅ اختار الـ session مباشرة
            this.currentSession = res.data;
            await this.chatService.joinSession(session.id);

            this.scrollToBottom();
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.error('Error joining session:', err);
        }
      });
    } catch (err) {
      console.error('Error in agentJoinSession:', err);
    }
  }

  async selectSession(session: ChatSession): Promise<void> {
    // ✅ لو نفس الـ session، متعملش حاجة
    if (this.currentSession?.id === session.id) return;

    if (this.currentSession) {
      await this.chatService.leaveSession(this.currentSession.id);
    }

    this.chatService.getSession(session.id).subscribe({
      next: async (res: any) => {
        if (res.success) {
          this.currentSession = res.data;
          await this.chatService.joinSession(session.id);
          this.scrollToBottom();
          this.cdr.detectChanges();  // ✅ أضف ده
        }
      }
    });
  }

  async sendMessage(): Promise<void> {
    if (!this.newMessage.trim() || !this.currentSession) return;

    const content = this.newMessage.trim();
    this.newMessage = '';

    await this.chatService.sendMessage(this.currentSession.id, content);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  async closeCurrentSession(): Promise<void> {
    if (!this.currentSession) return;

    await this.chatService.closeSession(this.currentSession.id);
    this.activeSessions = this.activeSessions.filter(s => s.id !== this.currentSession!.id);
    this.currentSession = null;
  }

  formatTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}