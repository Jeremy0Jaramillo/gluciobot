import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  alerta: boolean = false;
  isLogin = true;
  alertaMessage = '';
  name: any;
  specialization: any;


  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private firestore: AngularFirestore
  ) {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        // User is logged in, navigate to home page
        this.router.navigate(['/dashboard']);
      } else {
        // User is logged out
      }
    });
  }

  login(email: string, password: string) {
    this.afAuth.signInWithEmailAndPassword(email, password)
      .then(userCredential => {
        // Handle successful login
      })
      .catch(error => {
        // Handle login error
        console.error('Login error:', error);
        this.alerta = true;
      });
  }

  register(email: string, password: string, name: string, specialization: string) {
    this.afAuth.createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        if (userCredential.user) {
          // Registration successful, write user data to Firestore
          this.firestore.collection('doctors').doc(userCredential.user.uid).set({
            email: userCredential.user.email,
            name: name,
            specialization: specialization
          }).then(() => {
            console.log('User registered and data written to Firestore.');
          }).catch(error => {
            console.error('Error writing user data to Firestore:', error);
          });
        }
      })
      .catch(error => {
        // Handle registration error
        console.error('Registration error:', error);
      });
  }
  

}