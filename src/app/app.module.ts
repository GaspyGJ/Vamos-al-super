import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//Componentes
import { AppComponent } from './app.component';
import { LoginComponent } from './componentes/login/login.component';
import { LoginService } from './servicios/login.service';
import { RegisterComponent } from './componentes/register/register.component';
import { ListaComponent } from './componentes/lista/lista.component';
import { CarritoComponent } from './componentes/carrito/carrito.component';
import { ComprasComponent } from './componentes/compras/compras.component';
import { CompraComponent } from './componentes/compras/compra/compra.component';

const NombreRoutes: Routes = [
  { path: 'lista', component: ListaComponent },
  { path: 'carrito', component: CarritoComponent },
  { path: 'compras', component: ComprasComponent },
  { path: 'compra', component: CompraComponent },
  { path: '', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ListaComponent,
    CarritoComponent,
    ComprasComponent,
    CompraComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(NombreRoutes),
    ToastrModule.forRoot({
      timeOut: 2000,
      positionClass: 'toast-bottom-right',
      progressBar: true,
      tapToDismiss: true,
    }),
  ],
  providers: [LoginService],
  bootstrap: [AppComponent],
})
export class AppModule {}
