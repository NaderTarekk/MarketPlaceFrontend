import { Injectable, NgZone, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../../../environment';

export enum ChatType {
  Bot = 0,
  LiveSupport = 1
}

export enum ChatStatus {
  Active = 0,
  Waiting = 1,
  Closed = 2
}

export enum MessageSenderType {
  Customer = 0,
  Bot = 1,
  Agent = 2
}

export interface ChatMessage {
  id: number;
  sessionId: number;
  senderId?: string;
  senderName: string;
  content: string;
  senderType: MessageSenderType;
  isRead: boolean;
  createdAt: Date;
}

export interface ChatSession {
  id: number;
  sessionCode: string;
  customerName: string;
  agentName?: string;
  type: ChatType;
  status: ChatStatus;
  createdAt: Date;
  lastMessageAt: Date;
  messages: ChatMessage[];
}

export interface ChatHubMessage {
  sessionId: number;
  sessionCode: string;
  messageId: number;
  content: string;
  senderName: string;
  senderType: MessageSenderType;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService implements OnDestroy {
  private hubConnection!: signalR.HubConnection;
  private apiUrl = environment.baseApi + '/api/Chat';

  private messageReceived$ = new Subject<ChatHubMessage>();
  private userTyping$ = new Subject<string>();
  private userStoppedTyping$ = new Subject<string>();
  private sessionClosed$ = new Subject<number>();
  private agentJoined$ = new Subject<ChatSession>();
  private connectionState$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private ngZone: NgZone) { }

  async startConnection(): Promise<void> {
    const token = localStorage.getItem('NHC_MP_Token');

    if (!token) {
      console.error('No token found');
      throw new Error('No token');
    }

    // ✅ لو الاتصال موجود بالفعل
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      console.log('Already connected');
      return;
    }

    const hubUrl = environment.baseApi + '/chathub';
    console.log('Connecting to:', hubUrl);

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Debug) // ✅ Debug logging
      .build();

    this.registerHubEvents();

    try {
      await this.hubConnection.start();
      console.log('✅ SignalR Connected!');
      this.connectionState$.next(true);
    } catch (err) {
      console.error('❌ SignalR Error:', err);
      this.connectionState$.next(false);
      throw err;
    }
  }

  private waitingSessionsUpdate$ = new Subject<ChatSession[]>();
  get onWaitingSessionsUpdate(): Observable<ChatSession[]> {
    return this.waitingSessionsUpdate$.asObservable();
  }

   private registerHubEvents(): void {
    this.hubConnection.on('ReceiveMessage', (message: ChatHubMessage) => {
      this.ngZone.run(() => {  // ✅ لف بـ ngZone
        this.messageReceived$.next(message);
      });
    });

    this.hubConnection.on('WaitingSessionsUpdate', (sessions: ChatSession[]) => {
      this.ngZone.run(() => {
        this.waitingSessionsUpdate$.next(sessions);
      });
    });

    this.hubConnection.on('UserTyping', (userId: string) => {
      this.ngZone.run(() => {
        this.userTyping$.next(userId);
      });
    });

    this.hubConnection.on('UserStoppedTyping', (userId: string) => {
      this.ngZone.run(() => {
        this.userStoppedTyping$.next(userId);
      });
    });

    this.hubConnection.on('SessionClosed', (sessionId: number) => {
      this.ngZone.run(() => {
        this.sessionClosed$.next(sessionId);
      });
    });

    this.hubConnection.on('AgentJoined', (session: ChatSession) => {
      this.ngZone.run(() => {
        this.agentJoined$.next(session);
      });
    });

    this.hubConnection.on('Connected', (connectionId: string) => {
      this.ngZone.run(() => {
        console.log('Connected with ID:', connectionId);
      });
    });

    this.hubConnection.onreconnecting(() => {
      this.ngZone.run(() => {
        console.log('SignalR Reconnecting...');
        this.connectionState$.next(false);
      });
    });

    this.hubConnection.onreconnected(() => {
      this.ngZone.run(() => {
        console.log('SignalR Reconnected');
        this.connectionState$.next(true);
      });
    });

    this.hubConnection.onclose(() => {
      this.ngZone.run(() => {
        console.log('SignalR Disconnected');
        this.connectionState$.next(false);
      });
    });
  }

  async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.connectionState$.next(false);
    }
  }

  async joinSession(sessionId: number): Promise<void> {
    if (this.isConnected) {
      await this.hubConnection.invoke('JoinSession', sessionId);
    }
  }

  async leaveSession(sessionId: number): Promise<void> {
    if (this.isConnected) {
      await this.hubConnection.invoke('LeaveSession', sessionId);
    }
  }

  async sendMessage(sessionId: number, content: string): Promise<void> {
    if (this.isConnected) {
      await this.hubConnection.invoke('SendMessage', sessionId, content);
    }
  }

  async typing(sessionId: number): Promise<void> {
    if (this.isConnected) {
      await this.hubConnection.invoke('Typing', sessionId);
    }
  }

  async stopTyping(sessionId: number): Promise<void> {
    if (this.isConnected) {
      await this.hubConnection.invoke('StopTyping', sessionId);
    }
  }

  async closeSession(sessionId: number): Promise<void> {
    if (this.isConnected) {
      await this.hubConnection.invoke('CloseSession', sessionId);
    }
  }

  async markAsRead(sessionId: number): Promise<void> {
    if (this.isConnected) {
      await this.hubConnection.invoke('MarkAsRead', sessionId);
    }
  }

  async joinAgentsRoom(): Promise<void> {
    if (this.isConnected) {
      await this.hubConnection.invoke('JoinAgentsRoom');
    }
  }

  async agentJoinSession(sessionId: number): Promise<void> {
    if (this.isConnected) {
      await this.hubConnection.invoke('AgentJoinSession', sessionId);
    }
  }

  // HTTP Methods
  startChat(type: ChatType): Observable<any> {
    return this.http.post(`${this.apiUrl}/start`, { type });
  }

  getSession(sessionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/session/${sessionId}`);
  }

  getMySessions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-sessions`);
  }

  getWaitingSessions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/waiting`);
  }

  getFaq(): Observable<any> {
    return this.http.get(`${this.apiUrl}/faq`);
  }

  // Observables
  get onMessageReceived(): Observable<ChatHubMessage> {
    return this.messageReceived$.asObservable();
  }

  get onUserTyping(): Observable<string> {
    return this.userTyping$.asObservable();
  }

  get onUserStoppedTyping(): Observable<string> {
    return this.userStoppedTyping$.asObservable();
  }

  get onSessionClosed(): Observable<number> {
    return this.sessionClosed$.asObservable();
  }

  get onAgentJoined(): Observable<ChatSession> {
    return this.agentJoined$.asObservable();
  }

  get connectionStatus(): Observable<boolean> {
    return this.connectionState$.asObservable();
  }

  get isConnected(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }

  ngOnDestroy(): void {
    this.stopConnection();
  }


}