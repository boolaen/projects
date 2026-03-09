import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz.' })
    @IsNotEmpty({ message: 'E-posta boş bırakılamaz.' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Kullanıcı adı boş bırakılamaz.' })
    @MinLength(3, { message: 'Kullanıcı adı en az 3 karakter olmalıdır.' })
    username: string;

    @IsString()
    @IsNotEmpty({ message: 'Şifre boş bırakılamaz.' })
    @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır.' })
    password: string;
}

export class LoginDto {
    @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz.' })
    @IsNotEmpty({ message: 'E-posta boş bırakılamaz.' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Şifre boş bırakılamaz.' })
    password: string;
}
