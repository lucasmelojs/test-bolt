import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'JWT access token'
    })
    access_token: string;

    @ApiProperty({
        example: 'user@example.com',
        description: 'User email'
    })
    email: string;

    @ApiProperty({
        example: 'user',
        description: 'User role'
    })
    role: string;
}