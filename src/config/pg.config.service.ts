import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";


@Injectable()
export class PgConfigService implements TypeOrmOptionsFactory {
    constructor(private readonly configService: ConfigService){}

    createTypeOrmOptions(): TypeOrmModuleOptions{
        return{
            type: "postgres",
            url: this.configService.get <string> ('DATABASE_URL'),
            /* host: this.configService.get <string> ('PG_NEON_HOST'),
            port: this.configService.get <number> ('PG_NEON_PORT'),
            username: this.configService.get <string> ('PG_NEON_USERNAME'),
            password: this.configService.get <string> ('PG_NEON_PASSWORD'),
            database: this.configService.get <string> ('PG_NEON_DATABASE'), */
            entities: [__dirname + '/../**/*.entity{.js,.ts}'],
            synchronize: false,
            ssl: true
        }
    }
}