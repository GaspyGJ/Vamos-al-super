//Clases
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
//Mis Servicios
import { LoginService } from 'src/app/servicios/login.service';

declare var google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent  implements AfterViewInit {

  constructor(private loginService: LoginService, private router: Router) { }

  ngAfterViewInit(): void {
    google.accounts.id.renderButton(
      document.getElementById("btn-google"),
      { theme:"outline", size:"medium", text:"continue_with", shape: "pill", locale: "es_ES" }  // customization attributes
    );
  }
  ingresarConGoogle() {
    //nothing
  }
  ingresarSinUsuario() {
    this.loginService.loginAnonimo();
  }
  ingresarEmailPassward(form: NgForm) {
    const email = form.value.email;
    const password = form.value.password;
    this.loginService.loginEmailPassword(email, password);
  }

  registrar() {
    this.router.navigate(['/register']);
  }

  mostrarPassword(password: HTMLInputElement) {
    if (password.type === "password") {
      password.type = "text";
    } else {
      password.type = "password";
    }
  }


}
