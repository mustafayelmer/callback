import dotenv from 'dotenv';
dotenv.config();

import {fqn} from "@leyyo/fqn";
import {cast} from "./CastCallback";

class MyClass {
    constructor() {
        fqn.fnBind(this, this.half);
        cast.add(this.half, 'Half', 'half');
    }
    half(value: number): number {
        return value/2;
    }
}
const myClass = new MyClass();
console.log(cast.run('half', 5));