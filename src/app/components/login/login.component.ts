import { ThemeService } from './../../services/theme.service';
import { Component, OnInit } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  constructor(
    private authService: AuthService,
    private toast: HotToastService,
    private router: Router,
    private fb: NonNullableFormBuilder,
    private ThemeService: ThemeService
  ) {}

  ngOnInit(): void {}

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  submit() {
    const { email, password } = this.loginForm.value;

    if (!this.loginForm.valid || !email || !password) {
      return;
    }

    this.authService.login(email, password).subscribe(() => {
      // Verificar o tema do usuário logado
      this.ThemeService.getThemeByUser('userId').subscribe(theme => {
        if (theme) {
          // Se o tema existir, definir o tema do usuário
          this.ThemeService.setTheme(theme);
        } else {
          // Se o tema não existir, definir o tema padrão
          this.ThemeService.setTheme('default');
        }
      });

      this.toast.success('Logado com sucesso');
      this.router.navigate(['/home']);
    }, (error) => {
      // Manipular erros de autenticação
      this.toast.error(`Houve um erro: ${error.message}`);
    });
  }
}
