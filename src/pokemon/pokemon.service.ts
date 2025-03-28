import { BadRequestException, ConfigurableModuleBuilder, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>,

    private readonly configService: ConfigService
  ){}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      console.log(error);
      this.handleExceptions(error);
    }

    
  }

  findAll(paginationDto: PaginationDto) {
    const defaultLimit = this.configService.get('defaultLimit');
    const {limit = defaultLimit, offset = 0} = paginationDto;
    return this.pokemonModel.find()
    .limit(limit)
    .skip(offset)
  }

  async findOne(id: string) {
    
    let pokemon: Pokemon | null = null;

    if ( !isNaN(+id) ) {
      pokemon = await this.pokemonModel.findOne({ no: id });
    }

    // MongoID
    if ( !pokemon && isValidObjectId( id ) ) {
      pokemon = await this.pokemonModel.findById( id );
    }

    // Name
    if ( !pokemon ) {
      pokemon = await this.pokemonModel.findOne({ name: id.toLowerCase().trim() })
    }

    //No se encuentra por ninguno de los parametros
    if ( !pokemon ) 
      throw new NotFoundException(`Pokemon with id, name or no "${ id }" not found`);
    

    return pokemon;
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(id);
    if(updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

      try {
        await pokemon.updateOne(updatePokemonDto, {new: true})
    
        return {...pokemon.toJSON(), ...updatePokemonDto};
      } catch (error){
      this.handleExceptions(error);
      }
    }

  async remove(id: string) {
    const {deletedCount} = await this.pokemonModel.deleteOne({_id: id});

    if(deletedCount === 0)
      throw new BadRequestException(`El pokemon con id ${id} no existe`)
    
    return;
  }


  private handleExceptions(error: any){
    if (error.code === 11000) {
      throw new BadRequestException(`El pokemon ya existe en la bbdd ${JSON.stringify(error.keyValue)}`)
    }
    throw new InternalServerErrorException(`No se puede crear el pokemon, revisa los logs`)
    }
  };
 

