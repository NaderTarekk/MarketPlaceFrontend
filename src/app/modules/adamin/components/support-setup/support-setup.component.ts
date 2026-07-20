import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { I18nService } from '../../../../core/services/i18n.service';
import { ChatService } from '../../../chat/services/chat.service';
import { ToastrService } from 'ngx-toastr';

interface Department {
  id: number;
  nameAr: string;
  nameEn: string;
  isActive: boolean;
  membersCount?: number;
}

interface CsAgent {
  id: string;
  fullName: string;
  email?: string;
  departmentIds: number[];
  departmentNames: string[];
}

@Component({
  selector: 'app-support-setup',
  standalone: false,
  templateUrl: './support-setup.component.html',
  styleUrl: './support-setup.component.css',
})
export class SupportSetupComponent implements OnInit {
  departments: Department[] = [];
  agents: CsAgent[] = [];
  isLoadingDepts = false;
  isLoadingAgents = false;

  showDeptDialog = false;
  editingDept: Department | null = null;
  deptForm = { nameAr: '', nameEn: '', isActive: true };

  editingAgentId: string | null = null;
  editingAgentSelectedIds: Set<number> = new Set();

  constructor(
    public i18n: I18nService,
    private chatService: ChatService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.loadAgents();
  }

  loadDepartments(): void {
    this.isLoadingDepts = true;
    this.chatService.getAllDepartments().subscribe({
      next: (res: any) => {
        if (res.success) this.departments = res.data || [];
        this.isLoadingDepts = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoadingDepts = false; }
    });
  }

  loadAgents(): void {
    this.isLoadingAgents = true;
    this.chatService.getCsAgents().subscribe({
      next: (res: any) => {
        if (res.success) this.agents = res.data || [];
        this.isLoadingAgents = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoadingAgents = false; }
    });
  }

  openNewDept(): void {
    this.editingDept = null;
    this.deptForm = { nameAr: '', nameEn: '', isActive: true };
    this.showDeptDialog = true;
  }

  openEditDept(d: Department): void {
    this.editingDept = d;
    this.deptForm = { nameAr: d.nameAr, nameEn: d.nameEn, isActive: d.isActive };
    this.showDeptDialog = true;
  }

  closeDeptDialog(): void {
    this.showDeptDialog = false;
    this.editingDept = null;
  }

  saveDept(): void {
    if (!this.deptForm.nameAr?.trim()) {
      this.toastr.error(this.i18n.currentLang === 'ar' ? 'الاسم بالعربي مطلوب' : 'Arabic name is required');
      return;
    }
    const call = this.editingDept
      ? this.chatService.updateDepartment(this.editingDept.id, this.deptForm)
      : this.chatService.createDepartment(this.deptForm);
    call.subscribe({
      next: (res: any) => {
        if (res.success) {
          this.toastr.success(this.i18n.currentLang === 'ar' ? 'تم الحفظ' : 'Saved');
          this.closeDeptDialog();
          this.loadDepartments();
          this.loadAgents();
        } else {
          this.toastr.error(res.message || 'Error');
        }
      },
      error: (err) => this.toastr.error(err?.error?.message || 'Error')
    });
  }

  deleteDept(d: Department): void {
    if (!confirm(this.i18n.currentLang === 'ar' ? `حذف قسم "${d.nameAr}"?` : `Delete "${d.nameAr}"?`)) return;
    this.chatService.deleteDepartment(d.id).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.toastr.success(this.i18n.currentLang === 'ar' ? 'تم الحذف' : 'Deleted');
          this.loadDepartments();
          this.loadAgents();
        }
      },
      error: (err) => this.toastr.error(err?.error?.message || 'Error')
    });
  }

  startEditAgent(agent: CsAgent): void {
    this.editingAgentId = agent.id;
    this.editingAgentSelectedIds = new Set(agent.departmentIds || []);
  }

  cancelEditAgent(): void {
    this.editingAgentId = null;
    this.editingAgentSelectedIds.clear();
  }

  toggleAgentDept(deptId: number): void {
    if (this.editingAgentSelectedIds.has(deptId)) this.editingAgentSelectedIds.delete(deptId);
    else this.editingAgentSelectedIds.add(deptId);
  }

  saveAgentDepartments(agent: CsAgent): void {
    const ids = Array.from(this.editingAgentSelectedIds);
    this.chatService.setAgentDepartments(agent.id, ids).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.toastr.success(this.i18n.currentLang === 'ar' ? 'تم الحفظ' : 'Saved');
          this.cancelEditAgent();
          this.loadAgents();
        }
      },
      error: (err) => this.toastr.error(err?.error?.message || 'Error')
    });
  }
}
