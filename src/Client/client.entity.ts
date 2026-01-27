import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity({name: "usuarios"})
export class ClientEntity {
    @PrimaryGeneratedColumn({name: 'id'})
    id:number;

    @Column({name: 'nome', length:100, nullable:false})
    name: string;

    @CreateDateColumn({name: 'data_criacao'})
    created: Date;
}