import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from '../modules/chat/components/chat/chat.component';
import { AgentDashboardComponent } from '../modules/chat/components/agent-dashboard/agent-dashboard.component';
import { CustomerLookupComponent } from '../modules/chat/components/customer-lookup/customer-lookup.component';
import { ConversationsComponent } from '../modules/chat/components/conversations/conversations.component';

const routes: Routes = [
  {path: '', component: ChatComponent},
  {path: 'agent-dashboard', component: AgentDashboardComponent},
  {path: 'customer-lookup', component: CustomerLookupComponent},
  {path: 'conversations', component: ConversationsComponent},
  {path: 'monitor', component: ConversationsComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatRoutingModule { }
