import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function createPasswordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) return null;

    const hasUpperCase = /[A-Z]+/g.test(value);
    const hasLowerCase = /[a-z]+/g.test(value);
    const hasNumeric = /[0-9]+/g.test(value);

    const isPasswordValid = hasUpperCase && hasLowerCase && hasNumeric;

    return !isPasswordValid ? { passwordStrength: true } : null;
  };
}
