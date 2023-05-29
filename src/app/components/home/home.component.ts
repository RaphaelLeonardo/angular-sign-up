import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { UsersService } from 'src/app/services/users.service';

import { ThemOption } from 'src/app/models/them-option';
import { Task } from '../task/task';
import { CdkDragDrop, CdkDrag, transferArrayItem, moveItemInArray } from '@angular/cdk/drag-drop';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';
import { TaskDialogResult } from '../task-dialog/task-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AngularFirestoreModule, AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore/';
import { Observable } from 'rxjs';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BehaviorSubject } from 'rxjs';
import { ProfileUser } from 'src/app/models/user';
import { map, take } from 'rxjs/operators';
import { collection } from 'firebase/firestore';
import { ThemeService } from 'src/app/services/theme.service';



const getObservable = (collection: AngularFirestoreCollection<Task>) => {
  const subject = new BehaviorSubject<Task[]>([]);
  collection.valueChanges({ idField: 'id' }).subscribe((val: Task[]) => {
    subject.next(val);
  });
  return subject;
};


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {

  private themeCollection = 'themes';
  user$ = this.usersService.currentUserProfile$;
  userId: string | null = null;

  constructor(private usersService: UsersService, private dialog: MatDialog, private store: AngularFirestore, private AuthService: AuthService) {}

  ngOnInit(): void {this.AuthService.currentUser$.subscribe(user => {
    this.userId = user?.uid;
  });}

  filterTasksByUser(tasks: Task[]): Task[] {
    return tasks.filter(task => task.userId === this.userId);
  }

 /* todo: Task[] = [
    {
      title: 'Criar um app em Angular',
      description: 'Primeiro passo: Deitar no chão e chorar'
    },
    {
      title: 'Criar um app Kanban',
      description: 'Mais fácil do que parece... Será?'
    }
  ];
  inProgress: Task[] = [];
  done: Task[] = [];*/



  todo = getObservable(this.store.collection('todo')) as Observable<Task[]>;
  inProgress = getObservable(this.store.collection('inProgress')) as Observable<Task[]>;
  done = getObservable(this.store.collection('done')) as Observable<Task[]>;

  editTask(list: 'done' | 'todo' | 'inProgress', task: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task,
        enableDelete: true,
      },
    });


    dialogRef.afterClosed().subscribe((result: TaskDialogResult|undefined) => {
      if (!result) {
        return;
      }
      if (result.delete) {
        this.store.collection(list).doc(task.id).delete();
      } else {
        this.store.collection(list).doc(task.id).update(task);
      }
    });
  }
/* drop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      return;
    }
    if (!event.container.data || !event.previousContainer.data) {
      return;
    }
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }*/
  drop(event: CdkDragDrop<Task[] | null>): void {
    if (event.previousContainer === event.container) {
      return;
    }
    const item = event.previousContainer.data[event.previousIndex];
    this.store.firestore.runTransaction(() => {
      const promise = Promise.all([
        this.store.collection(event.previousContainer.id).doc(item.id).delete(),
        this.store.collection(event.container.id).add(item),
      ]);
      return promise;
    });
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }


  newTask(): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task: {},
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: TaskDialogResult|undefined) => {
        if (!result) {
          return;
        }
        this.AuthService.currentUser$.pipe(take(1)).subscribe(user => {
          const userId = user?.uid; // Obtém o ID do usuário atual
          if (userId) {
            const taskWithUserId = { ...result.task, userId }; // Adiciona o ID do usuário à tarefa
            this.store.collection('todo').add(taskWithUserId);
          }
        });
      });
  }
}
//this.store.collection('todo').add(result.task)      });
