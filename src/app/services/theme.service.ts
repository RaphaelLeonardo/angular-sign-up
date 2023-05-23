import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Option } from '../models/option';
import { StyleManagerService } from './style-manager.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { map } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeCollection = 'themes'; // Nome da coleção no Firestore


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
        const themeData = { theme: themeToSet };

        this.firestore.collection(this.themeCollection).doc(userId).set(themeData)
          .then(() => console.log('Tema salvo no Firebase'))
          .catch(error => console.error('Erro ao salvar o tema no Firebase:', error));
      }
    });
  }

  getThemeByUser(userId: string): Observable<string> {
    return this.firestore.collection(this.themeCollection).doc(userId)
      .valueChanges()
      .pipe(
        map((data: any) => data?.theme)
      );
  }
}
