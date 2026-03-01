import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './components/chat/chat.component';
import { FormsModule } from '@angular/forms';
import { ChatRoutingModule } from '../../routing/chat-routing-module';
import { AgentDashboardComponent } from './components/agent-dashboard/agent-dashboard.component';
import { SharedModule } from '../../shared/shared-module';



@NgModule({
  declarations: [
    ChatComponent,
    AgentDashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ChatRoutingModule,
    SharedModule
  ]
})
export class ChatModule { }
