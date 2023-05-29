import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Option } from '../models/option';
import { StyleManagerService } from './style-manager.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { map } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { UsersService } from './users.service';
import { ThemOption } from '../models/them-option';


@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeCollection = 'themes'; // Nome da coleção no Firestore
  private currentThemeSubject: BehaviorSubject<string> = new BehaviorSubject<string>(''); // Subject para armazenar o tema atual
  public themeChanged$: Observable<string> = this.currentThemeSubject.asObservable(); // Observable para acompanhar as alterações do tema

  constructor(
    private http: HttpClient,
    private styleManager: StyleManagerService,
    private auth: AngularFireAuth,
    private firestore: AngularFirestore
  ) { }
  getThemeOptions(): Observable<Array<Option>> {
    return this.http.get<Array<Option>>("assets/options.json");
  }

  setTheme(themeToSet: string) {
    this.styleManager.setStyle(
      "theme",
      `assets/${themeToSet}.css`
    );

    // Salvar o tema no Firebase
    this.auth.currentUser.then(user => {
      if (user) {
        const userId = user.uid;
        const themeData = { userId: userId, theme: themeToSet };

        this.firestore.collection(this.themeCollection).doc(userId).set(themeData)
          .then(() => console.log('Tema salvo no Firebase'))
          .catch(error => console.error('Erro ao salvar o tema no Firebase:', error));
      }
    });
     // Atualizar o tema atual
     this.currentThemeSubject.next(themeToSet);
  }


  getCurrentTheme(): Observable<string> {
    return this.currentThemeSubject.asObservable();
  }

  getThemeByUser(userId: string): Observable<ThemOption> {
    return new Observable<ThemOption>((observer) => {
      this.auth.currentUser.then((user) => {
        if (user) {
          const userId = user.uid;
          this.firestore.collection('themes').doc(userId).get().subscribe((snapshot) => {
            const theme = snapshot.data() as ThemOption;
            observer.next(theme);
            observer.complete();
          }, (error) => {
            observer.error(error);
          });
        } else {
          observer.error(new Error('User not authenticated'));
        }
      });
    });
  }

 }

