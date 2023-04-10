import { Component, Input } from "@angular/core";
import { HttpClient, HttpEventType } from "@angular/common/http";
import { catchError, finalize } from "rxjs/operators";
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from "@angular/forms";
import { noop, of, throwError } from "rxjs";

@Component({
  selector: "file-upload",
  templateUrl: "file-upload.component.html",
  styleUrls: ["file-upload.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: FileUploadComponent,
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: FileUploadComponent,
    },
  ],
})
export class FileUploadComponent implements ControlValueAccessor, Validator {
  @Input() requiredFileType: string;

  fileName: string = "";
  fileUploadError: boolean = false;
  fileUploadSuccess: boolean = false;
  uploadProgress?: number;

  onChange: Function = (fileName: string) => {};
  onTouched: Function = () => {};
  disabled: boolean = false;
  onValidatorChange: Function = () => {};

  constructor(private http: HttpClient) {}

  onClick(fileUpload: HTMLInputElement) {
    this.onTouched();
    fileUpload.click();
  }

  onFileSelected(event): void {
    const file: File = event.target.files[0];
    const formData = new FormData();

    this.fileName = file.name;
    this.fileUploadError = false;

    formData.append("thumbnail", file);

    this.http
      .post("/api/thumbnail-upload", formData, {
        reportProgress: true,
        observe: "events",
      })
      .pipe(
        catchError((error) => {
          this.fileUploadError = true;
          return throwError(() => new Error(error));
        }),
        finalize(() => (this.uploadProgress = null))
      )
      .subscribe((event) => {
        if (event.type === HttpEventType.UploadProgress)
          this.uploadProgress = Math.round(100 * (event.loaded / event.total));

        if (event.type === HttpEventType.Response) {
          this.fileUploadSuccess = true;
          this.onChange(this.fileName);
          this.onValidatorChange();
        }
      });
  }

  writeValue(value: any): void {
    this.fileName = value;
  }

  registerOnChange(onChange: () => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }

  registerOnValidatorChange(onValidatorChange: () => void): void {
    this.onValidatorChange = onValidatorChange;
  }

  validate(control: AbstractControl<any, any>): ValidationErrors {
    if (this.fileUploadSuccess) return null;

    const errors: any = {
      reguiredFileTypes: this.requiredFileType,
    };

    if (this.fileUploadError) errors.uploadFailed = true;

    return errors;
  }
}
