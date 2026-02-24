import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from '../modules/chat/components/chat/chat.component';
import { AgentDashboardComponent } from '../modules/chat/components/agent-dashboard/agent-dashboard.component';

const routes: Routes = [
  {path: '', component: ChatComponent},
  {path: 'agent-dashboard', component: AgentDashboardComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatRoutingModule { }
