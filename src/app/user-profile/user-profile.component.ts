import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RequestOptions } from '@angular/http';
import { catchError } from 'rxjs/internal/operators';
import { Observable, of } from 'rxjs';

declare var $: any;
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  otpGeneratorForm: FormGroup;
  SERVER_URL = "http://localhost:8080/OTPGenerate/rest/hello";
  public imagePath;
  imgURL: any;
  public message: string;
  public hiddenPin;
  timeLeft: number = 180;
  interval;
  IsHiddenTimer = true;
  public userOTP;
  public hiddenPinTemp;
  IsGenOTPDisable = false;
  Isvalidate = true;
  numOfAttempts: number = 2;
  IsRegenOTDisable = true;
  displayAttempts = false;
  validateAttempts = false;
  check = false;
  numOfValAttempts: number = 3;
  private secretKey: FormControl;

  constructor(private fb: FormBuilder, private http: HttpClient) { }


  ngOnInit() {
    this.IsRegenOTDisable = true;
    this.Isvalidate = true;
    this.secretKey = new FormControl('');
    this.otpGeneratorForm = this.fb.group({
      secretKey: this.secretKey
    });
    webPreferences: {
      webSecurity: false
    }
  }

  generateOTPEvent() {
    console.log("ok");

    // this.http.get("/OTPGenerate/rest/hello/west").subscribe(
    //   (res) => console.log(res),
    //   (err) => console.log(err)
    // );
    this.http.post<any>("http://localhost:8080/OTPGenerate/rest/hello/generateOTP", null).subscribe(
      (res) => console.log(res),
      (err) => console.log(err)
    );

    this.showNotification();
    this.IsHiddenTimer = false;
    this.IsGenOTPDisable = true;
    this.IsRegenOTDisable = false;
    this.Isvalidate = false;
    this.timeLeft = 180;
    this.startTimer();
  }

  ReloadOTP() {

    this.numOfAttempts = this.numOfAttempts - 1;
    this.displayAttempts = true;
    //this.Isvalidate = true;
    if (this.numOfAttempts == 0) {
      this.IsRegenOTDisable = true;
      
    }

    this.http.post<any>("http://localhost:8080/OTPGenerate/rest/hello/generateOTP", null).subscribe(
      (res) => console.log(res),
      (err) => console.log(err)
    );
    this.Isvalidate = false;
    this.showNotification();
    this.timeLeft = 180;
    this.startTimer();
  }

  preview(files) {
    if (files.length === 0) {
      return;
    }

    if (this.IsHiddenTimer) {
      this.showTimerNotification();
      return;
    }

    var mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.message = "Only images are supported.";
      return;
    }

    var reader = new FileReader();
    this.imagePath = files;
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
    }

    let fileData: File = files[0];
    const formData = {
      'path': '‪E:/' + fileData.name,
      'userKey': this.userOTP
    }
    this.http.post<any>("/OTPGenerate/rest/hello/uploadImage", formData).subscribe(
      (res) => {
        // this.hiddenPin = res;
        this.hiddenPinTemp = res;
      },


    );
  }

  validatePinEvent() {

    if (this.imagePath == null || this.imagePath == '' || this.imagePath == 'undefined') {
      this.showNotificationInvalidImage();
      this.validateAttemptsFunc();
      return;
    }
    let fileData: File = this.imagePath[0];

    if (this.secretKey.value == null || this.secretKey.value == '' || this.secretKey.value == 'undefined') {
      this.showNotificationInvalidUserInput();
      this.validateAttemptsFunc();
      return;
    }

    const formData = {
      'path': 'D:/' + fileData.name,
      'userKey': this.secretKey.value,
      'hiddenPin': this.hiddenPinTemp
    }

    this.http.post<any>("/OTPGenerate/rest/hello/validateOtp", formData).subscribe(
      (res) => {
        if (res == '1' || res == '2') {
          this.hiddenPin = '';
          this.showNotificationInvalidUserInput();
          this.validateAttemptsFunc();
          return;
        }

        this.showNotificationSuccessUserInput();
        this.hiddenPin = res;
        this.IsHiddenTimer = true;

      },

    );
  }

  validateAttemptsFunc(){
    this.validateAttempts = true;
    this.numOfValAttempts = this.numOfValAttempts-1;
    if(this.numOfValAttempts==0){
      this.showNotificationValidationAttempts();
      this.IsGenOTPDisable=true;
      this.IsRegenOTDisable = true;
      this.Isvalidate = true;
      this.IsHiddenTimer = true;
      this.imgURL = null;
    }
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      console.log(`${operation} failed: ${error.message}`);

      return of(result as T);
    };
  }

  showNotification() {
    const type = ['', 'info', 'success', 'warning', 'danger'];

    const color = Math.floor((Math.random() * 4) + 1);

    $.notify({
      icon: "notifications",
      message: "OTP generated successfully. Please check your E-mail"

    }, {
      type: 'success',
      timer: 4000,
      placement: {
        from: "top",
        align: "right"
      },
      template: '<div data-notify="container" class="col-xl-4 col-lg-4 col-11 col-sm-4 col-md-4 alert alert-{0} alert-with-icon" role="alert">' +
        '<button mat-button  type="button" aria-hidden="true" class="close mat-button" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
        '<i class="material-icons" data-notify="icon">notifications</i> ' +
        '<span data-notify="title">{1}</span> ' +
        '<span data-notify="message">{2}</span>' +
        '<div class="progress" data-notify="progressbar">' +
        '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
        '</div>' +
        '<a href="{3}" target="{4}" data-notify="url"></a>' +
        '</div>'
    });
  }

  startTimer() {
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.IsHiddenTimer = true;
        this.timeLeft = 10200;
        this.showTimerNotification();
        this.imgURL = null;
        this.message = null;
        this.Isvalidate = true;
      }
    }, 1000)
  }

  showTimerNotification() {
    const type = ['', 'info', 'success', 'warning', 'danger'];

    const color = Math.floor((Math.random() * 4) + 1);

    $.notify({
      icon: "notifications",
      message: "Time is over. Please Re-Generate OTP and try again!"


    }, {
      type: 'danger',
      timer: 4000,
      placement: {
        from: "top",
        align: "right"
      },
      template: '<div data-notify="container" class="col-xl-4 col-lg-4 col-11 col-sm-4 col-md-4 alert alert-{0} alert-with-icon" role="alert">' +
        '<button mat-button  type="button" aria-hidden="true" class="close mat-button" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
        '<i class="material-icons" data-notify="icon">notifications</i> ' +
        '<span data-notify="title">{1}</span> ' +
        '<span data-notify="message">{2}</span>' +
        '<div class="progress" data-notify="progressbar">' +
        '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
        '</div>' +
        '<a href="{3}" target="{4}" data-notify="url"></a>' +
        '</div>'
    });
  }

  showNotificationInvalidUserInput() {
    const type = ['', 'info', 'success', 'warning', 'danger'];

    const color = Math.floor((Math.random() * 4) + 1);

    $.notify({
      icon: "notifications",
      message: "Invalid user input. Please try again..."

    }, {
      type: 'warning',
      timer: 4000,
      placement: {
        from: "top",
        align: "right"
      },
      template: '<div data-notify="container" class="col-xl-4 col-lg-4 col-11 col-sm-4 col-md-4 alert alert-{0} alert-with-icon" role="alert">' +
        '<button mat-button  type="button" aria-hidden="true" class="close mat-button" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
        '<i class="material-icons" data-notify="icon">notifications</i> ' +
        '<span data-notify="title">{1}</span> ' +
        '<span data-notify="message">{2}</span>' +
        '<div class="progress" data-notify="progressbar">' +
        '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
        '</div>' +
        '<a href="{3}" target="{4}" data-notify="url"></a>' +
        '</div>'
    });
  }

  showNotificationInvalidImage() {
    const type = ['', 'info', 'success', 'warning', 'danger'];

    const color = Math.floor((Math.random() * 4) + 1);

    $.notify({
      icon: "notifications",
      message: "Invalid user image"

    }, {
      type: 'warning',
      timer: 4000,
      placement: {
        from: "top",
        align: "right"
      },
      template: '<div data-notify="container" class="col-xl-4 col-lg-4 col-11 col-sm-4 col-md-4 alert alert-{0} alert-with-icon" role="alert">' +
        '<button mat-button  type="button" aria-hidden="true" class="close mat-button" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
        '<i class="material-icons" data-notify="icon">notifications</i> ' +
        '<span data-notify="title">{1}</span> ' +
        '<span data-notify="message">{2}</span>' +
        '<div class="progress" data-notify="progressbar">' +
        '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
        '</div>' +
        '<a href="{3}" target="{4}" data-notify="url"></a>' +
        '</div>'
    });
  }

  showNotificationSuccessUserInput() {
    const type = ['', 'info', 'success', 'warning', 'danger'];

    const color = Math.floor((Math.random() * 4) + 1);

    $.notify({
      icon: "notifications",
      message: "OTP Verified Sucessfully"

    }, {
      type: 'success',
      timer: 4000,
      placement: {
        from: "top",
        align: "right"
      },
      template: '<div data-notify="container" class="col-xl-4 col-lg-4 col-11 col-sm-4 col-md-4 alert alert-{0} alert-with-icon" role="alert">' +
        '<button mat-button  type="button" aria-hidden="true" class="close mat-button" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
        '<i class="material-icons" data-notify="icon">notifications</i> ' +
        '<span data-notify="title">{1}</span> ' +
        '<span data-notify="message">{2}</span>' +
        '<div class="progress" data-notify="progressbar">' +
        '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
        '</div>' +
        '<a href="{3}" target="{4}" data-notify="url"></a>' +
        '</div>'
    });
  }

  showNotificationValidationAttempts() {
    const type = ['', 'info', 'success', 'warning', 'danger'];

    const color = Math.floor((Math.random() * 4) + 1);

    $.notify({
      icon: "notifications",
      message: "Number of attempts exceeded you are locked from the system."

    }, {
      type: 'danger',
      timer: 4000,
      placement: {
        from: "top",
        align: "right"
      },
      template: '<div data-notify="container" class="col-xl-4 col-lg-4 col-11 col-sm-4 col-md-4 alert alert-{0} alert-with-icon" role="alert">' +
        '<button mat-button  type="button" aria-hidden="true" class="close mat-button" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
        '<i class="material-icons" data-notify="icon">notifications</i> ' +
        '<span data-notify="title">{1}</span> ' +
        '<span data-notify="message">{2}</span>' +
        '<div class="progress" data-notify="progressbar">' +
        '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
        '</div>' +
        '<a href="{3}" target="{4}" data-notify="url"></a>' +
        '</div>'
    });
  }

}

class ImageSnippet {
  constructor(public src: string, public file: File) { }
}