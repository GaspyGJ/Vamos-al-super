import { AfterContentInit, Component } from '@angular/core';
import { LoginService } from './servicios/login.service';

//PARA INICIO DE SESION CON GOOGLE
declare var google: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterContentInit {
  title = 'Vamos al super';

  constructor(private loginService: LoginService) { }

  //PARA INICIO DE SESION CON GOOGLE
  ngAfterContentInit(): void {
    google.accounts.id.initialize({
      client_id:
        '738689616554-3bfum1kgbncjoic2lu246idob8n5sug9.apps.googleusercontent.com',
      ux_mode: "popup",
      callback: (response: any) => {
        // This next is for decoding the idToken to an object if you want to see the details.
        let base64Url = response.credential.split('.')[1];
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        let jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(function (c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
        );
        //      console.log(response.credential);
        const googleUser = JSON.parse(jsonPayload);
        //      console.log(googleUser);
        this.loginService.loginGoogle(googleUser.name, googleUser.email)
      },
    });
  }
}
