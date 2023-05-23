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
  options$: Observable<Array<Option>> = this.ThemeService.getThemeOptions();
  currentTheme: string;


  constructor(
    private authService: AuthService,
    public usersService: UsersService,
    private router: Router,
    private ThemeService: ThemeService
  ) {}

  ngOnInit() {

    this.authService.currentUser$.subscribe(user => {
      if (user) {
        const userId = user.uid;
        this.ThemeService.getThemeByUser(userId).subscribe(theme => {
          if (theme) {
            this.currentTheme = theme;
          } else {
            this.currentTheme = 'deeppurple-amber'; // Defina o tema padrão aqui
          }
        });
      } else {
        this.currentTheme = 'deeppurple-amber'; // Defina o tema padrão aqui
      }
    });
  }

  themeChangeHandler(themeToSet) {
    this.ThemeService.setTheme(themeToSet);
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/']);
    });
  }

}
