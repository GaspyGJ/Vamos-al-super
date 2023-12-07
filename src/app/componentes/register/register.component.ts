//Clases
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
//Mis Servicios
import { LoginService } from 'src/app/servicios/login.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  constructor(private loginService: LoginService, private router: Router) {}

  ngOnInit(): void {}

  registrarEmail_Password(form: NgForm) {
    const nombre = (<string>form.value.email).split('@')[0];
    const email = form.value.email;
    const password = form.value.password;

    this.loginService.registerEmailPassword(nombre, email, password);
    //en el servicio se redirige a armar lista.
  }

  mostrarPassword(password: HTMLInputElement) {
    if (password.type === 'password') {
      password.type = 'text';
    } else {
      password.type = 'password';
    }
  }
  salir() {
    this.router.navigate(['']);
  }
}
