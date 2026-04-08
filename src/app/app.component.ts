import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';

@Component({
  selector: 'gmt-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <div class="app-shell">
      <gmt-sidebar />
      <div class="app-main">
        <gmt-header />
        <main class="app-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-shell {
      display: flex;
      min-height: 100vh;
      background: var(--bg-primary);
    }

    .app-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow: hidden;
    }

    .app-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px 32px;
    }

    @media (max-width: 768px) {
      .app-content {
        padding: 16px;
      }
    }
  `],
})
export class AppComponent {}
