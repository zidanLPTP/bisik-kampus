export class Admin {
  constructor(
    public id: string,
    public username: string,
    public passwordHash: string,
    public nama: string,
    public role: string
  ) {}
}