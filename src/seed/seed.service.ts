import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';


@Injectable()
export class SeedService {

  constructor(
    @InjectModel( Pokemon.name )
        private readonly pokemonModel: Model<Pokemon>,
        private readonly http: AxiosAdapter
  ){}

  async executeSeed() {

    //Borrado de todos los pokemon antes de ejecutar el seed
    await this.pokemonModel.deleteMany({});

    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650')

    //const insertPromisesArray: Promise<Pokemon>[] = [];
    const pokemonToInsert: {name:string, no:number}[] = [];

    data.results.forEach(({name, url})=>{

      const segments = url.split('/');
      const no:number = +segments[segments.length -2];  
      
      //console.log(name,no);
      //const pokemon = await this.pokemonModel.create({name, no});
      // insertPromisesArray.push(
      //   this.pokemonModel.create({name,no})
      // );
      pokemonToInsert.push({name, no});
    });

    //const newArray = await Promise.all(insertPromisesArray);
    await this.pokemonModel.insertMany(pokemonToInsert);

    return 'Seed ejecutado';
  }

}
