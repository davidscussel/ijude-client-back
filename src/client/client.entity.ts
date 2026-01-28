// ARQUIVO: src/Client/client.entity.ts
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('client')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column()
  password: string;

  // --- NOVOS CAMPOS ---
  @Column({ nullable: true })
  cpf: string;

  @Column({ nullable: true })
  birthDate: string;
  // --------------------

  @Column({ nullable: true })
  verification_code: string;

  @Column({ default: false })
  is_verified: boolean;

  @CreateDateColumn()
  created_at: Date;
}