import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  
  private readonly logger = new Logger('ProductsService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected')
  }
  
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto
    });
  }

  async findAll( paginationDto: PaginationDto ) {

    const { limit, page } = paginationDto;

    const totalPages = await this.product.count({ where: { available: true } });
    const lastPage = Math.ceil( totalPages / limit! );

    const products = await this.product.findMany({
      skip: ( page! - 1 ) * limit!,
      take: limit,
      where: {
        available: true
      }
    })

    return {
      data: products,
      meta: {
        page: page,
        total: totalPages,
        lastPage: lastPage
      }
    }
  }

  async findOne(id: number) {

    const product = await this.product.findFirst({
      where: {
        id,
        available: true
      }
    });

    if ( !product ) throw new NotFoundException(`Product with id: [${id}] not founded.`);

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    
    const { id: __, ...data } = updateProductDto;

    await this.findOne(id);

    if ( Object.values(updateProductDto).length === 0 ) {
      return {
        message: "nothing for update"
      }
    }

    return await this.product.update({
      where: { id },
      data: data
    });
  }

  async remove(id: number) {

    await this.findOne(id);

    // return await this.product.delete({
    //   where: { id }
    // });

    const product = await this.product.update({
      where: { id },
      data: {
        available: false
      }
    });

    return product;
  }
}
