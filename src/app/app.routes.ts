import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './layout/dashboard/dashboard.component';
import { AddproductComponent } from './pages/addproduct/addproduct.component';
import { CategoryComponent } from './pages/category/category.component';
import { ExpiryComponent } from './pages/expiry/expiry.component';
import { LowStockComponent } from './pages/low-stock/low-stock.component';
import { OverviewDashboardComponent } from './pages/overview-dashboard/overview-dashboard.component';
import { PosComponent } from './pages/pos/pos.component';
import { ProductsComponent } from './pages/products/products.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ReturnsComponent } from './pages/returns/returns.component';
import { SalesDashb0ardComponent } from './pages/sales-dashb0ard/sales-dashb0ard.component';
import { SalesComponent } from './pages/sales/sales.component';
import { StaffSalesComponent } from './pages/staff-sales/staff-sales.component';
import { UpdatePasswordComponent } from './pages/update-password/update-password.component';
import { UsersComponent } from './pages/users/users.component';
import { ExpensesComponent } from './pages/expenses/expenses.component';
import { ExpensesCategoryComponent } from './pages/expenses-category/expenses-category.component';
import { RestockComponent } from './pages/restock/restock.component';
import { DebtorsComponent } from './pages/debtors/debtors.component';
import { NewdebtorComponent } from './pages/newdebtor/newdebtor.component';
import { SaleanalyticsComponent } from './pages/owner/saleanalytics/saleanalytics.component';
import { CustomersComponent } from './pages/owner/customers/customers.component';
import { AllocationsComponent } from './pages/owner/allocations/allocations.component';
import { BranchesComponent } from './pages/owner/branches/branches.component';
import { ProductAuditComponent } from './pages/owner/product-audit/product-audit.component';
import { authGuard } from './core/guards/auth.guard';
import { PermissionsComponent } from './pages/owner/permissions/permissions.component';
import { Pos2Component } from './pages/pos-2/pos-2.component';
import { HomepageComponent } from './homepage/homepage.component';

export const routes: Routes = [
    {
        path: 'dashboard',
        canActivate: [authGuard],
        component: DashboardComponent,
        children: [
            {path: 'products', component: ProductsComponent},
            {path: 'products/expiry', component: ExpiryComponent},
            {path: 'category', component: CategoryComponent},
            {path: 'add-product', component: AddproductComponent},
            {path: 'restock', component: RestockComponent},
            {path: 'low-stocks', component: LowStockComponent},
            {path: 'sales', component: SalesComponent},
            {path: 'debtors', component: DebtorsComponent},
            {path: 'overview-dashboard', component: OverviewDashboardComponent},
            {path: 'sales-dashboard', component: SalesDashb0ardComponent},
            {path: 'users', component: UsersComponent},
            {path: 'pos', component: PosComponent},
            {path: 'profile', component: ProfileComponent},
            {path: 'update-password', component: UpdatePasswordComponent},
            {path: 'returns', component: ReturnsComponent},
            {path: 'staff-sales/:id/:name', component: StaffSalesComponent},
            {path: 'expenses', component: ExpensesComponent},
            {path: 'expense-category', component: ExpensesCategoryComponent},
            {path: 'new-debtor', component: NewdebtorComponent},
            {path: 'owner/sales-analytics', component: SaleanalyticsComponent},
            {path: 'owner/customers', component: CustomersComponent},
            {path: 'owner/allocations', component: AllocationsComponent},
            {path: 'owner/branches', component: BranchesComponent},
            {path: 'owner/products-audits', component: ProductAuditComponent},
            {path: 'owner/user-permissions', component: PermissionsComponent},
        ]
    },
    {path: 'dashboard/pos-2', component: Pos2Component},
    { path: 'auth/login', component: LoginComponent },
    // { path: '', component: HomepageComponent },
];
