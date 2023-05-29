import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { UsersService } from './services/users.service';
import { Observable } from 'rxjs';

import { Option } from './models/option';
import { ThemeService } from './services/theme.service';
import { MenuComponent } from './menu/menu.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  user$ = this.usersService.currentUserProfile$;
  options$: Observable<Array<Option>> = this.themeService.getThemeOptions();
  currentTheme$: Observable<string> = this.themeService.getCurrentTheme();



  constructor(
    private authService: AuthService,
    public usersService: UsersService,
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        const userId = user.uid;
        this.themeService.getThemeByUser(userId).subscribe(theme => {
          this.themeService.setTheme(theme.theme);
        });
      } else {
        // Usuário não autenticado, defina o tema padrão
        this.themeService.setTheme('deeppurple-amber');
      }
    });
  }

  themeChangeHandler(themeToSet) {
    this.themeService.setTheme(themeToSet);
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/']);
    });
  }

}
