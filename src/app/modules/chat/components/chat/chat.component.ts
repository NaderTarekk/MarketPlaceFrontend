import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import {
  ChatService,
  ChatType,
  ChatStatus,
  MessageSenderType,
  ChatSession,
  ChatMessage,
  ChatHubMessage
} from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: false,
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  currentView: 'selection' | 'chat' = 'selection';
  session: ChatSession | null = null;
  messages: ChatMessage[] = [];
  newMessage = '';
  isLoading = false;
  isConnected = false;
  otherUserTyping = false;

  faqList: { question: string; keyword: string }[] = [];

  ChatType = ChatType;
  ChatStatus = ChatStatus;
  MessageSenderType = MessageSenderType;

  private destroy$ = new Subject<void>();
  private typingTimeout: any;
  private shouldScrollToBottom = false;

  constructor(private chatService: ChatService, private cdr: ChangeDetectorRef, private ngZone: NgZone) { }

  async ngOnInit(): Promise<void> {
    // ✅ تأكد الـ Token موجود قبل الاتصال
    const token = localStorage.getItem('NHC_MP_Token');
    if (!token) {
      console.error('No token - user not logged in');
      return;
    }

    try {
      await this.chatService.startConnection();
      console.log('Connection started successfully');
    } catch (err) {
      console.error('Connection failed:', err);
    }

    this.subscribeToEvents();
    this.loadFaq();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.session) {
      this.chatService.leaveSession(this.session.id);
    }
    this.chatService.stopConnection();
  }


  private subscribeToEvents(): void {
      this.chatService.connectionStatus
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.ngZone.run(() => {
          this.isConnected = status;
          if (status) {
          }
          this.cdr.detectChanges();
        });
      });
    // ✅ أضف ده - الاستماع لحالة الاتصال
    this.chatService.connectionStatus
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.ngZone.run(() => {
          this.isConnected = status;
          console.log('Connection status:', status); // للتأكد
          this.cdr.detectChanges();
        });
      });



    // باقي الكود زي ما هو
    this.chatService.onMessageReceived
      .pipe(takeUntil(this.destroy$))
      .subscribe((msg: ChatHubMessage) => {
        this.ngZone.run(() => {
          if (this.session && msg.sessionId === this.session.id) {
            this.messages.push({
              id: msg.messageId,
              sessionId: msg.sessionId,
              senderName: msg.senderName,
              content: msg.content,
              senderType: msg.senderType,
              isRead: false,
              createdAt: new Date(msg.createdAt)
            });
            this.shouldScrollToBottom = true;
            this.otherUserTyping = false;
            this.cdr.detectChanges();
          }
        });
      });

    this.chatService.onUserTyping
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.ngZone.run(() => {
          this.otherUserTyping = true;
          this.cdr.detectChanges();
        });
      });

    this.chatService.onUserStoppedTyping
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.ngZone.run(() => {
          this.otherUserTyping = false;
          this.cdr.detectChanges();
        });
      });

    this.chatService.onSessionClosed
      .pipe(takeUntil(this.destroy$))
      .subscribe((sessionId: number) => {
        this.ngZone.run(() => {
          if (this.session && this.session.id === sessionId) {
            this.session.status = ChatStatus.Closed;
            this.cdr.detectChanges();
          }
        });
      });

    this.chatService.onAgentJoined
      .pipe(takeUntil(this.destroy$))
      .subscribe((session: ChatSession) => {
        this.ngZone.run(() => {
          if (this.session && this.session.id === session.id) {
            this.session = session;
            this.messages = session.messages;
            this.shouldScrollToBottom = true;
            this.cdr.detectChanges();
          }
        });
      });
  }

  private loadFaq(): void {
    this.chatService.getFaq().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.faqList = res.data;
        }
      }
    });
  }

  async startChat(type: ChatType): Promise<void> {
    this.isLoading = true;
    console.log('Starting chat...', type);

    this.chatService.startChat(type).subscribe({
      next: async (res: any) => {
        if (res.success) {
          console.log('Response:', res);
          this.session = res.data;
          this.messages = res.data.messages || []; // ✅ عدل ده
          this.currentView = 'chat';

          if (this.session) {
            await this.chatService.joinSession(this.session.id);
          }
          this.cdr.detectChanges();
          this.shouldScrollToBottom = true;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.isLoading = false;
      }
    });
  }

  async sendMessage(): Promise<void> {
    if (!this.newMessage.trim() || !this.session || !this.isConnected) return;

    const content = this.newMessage.trim();
    this.newMessage = '';

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      await this.chatService.stopTyping(this.session.id);
    }

    await this.chatService.sendMessage(this.session.id, content);
    this.shouldScrollToBottom = true;
  }

  sendFaqQuestion(keyword: string): void {
    if (!this.session) return;
    this.newMessage = keyword;
    this.sendMessage();
  }

  onTyping(): void {
    if (!this.session || !this.isConnected) return;

    this.chatService.typing(this.session.id);

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    this.typingTimeout = setTimeout(() => {
      this.chatService.stopTyping(this.session!.id);
    }, 2000);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  async closeChat(): Promise<void> {
    if (!this.session) return;

    await this.chatService.closeSession(this.session.id);
    await this.chatService.leaveSession(this.session.id);
    this.session = null;
    this.messages = [];
    this.currentView = 'selection';
  }

  backToSelection(): void {
    if (this.session) {
      this.chatService.leaveSession(this.session.id);
    }
    this.session = null;
    this.messages = [];
    this.currentView = 'selection';
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) { }
  }

  isMyMessage(message: ChatMessage): boolean {
    return message.senderType === MessageSenderType.Customer;
  }

  formatTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  }
}