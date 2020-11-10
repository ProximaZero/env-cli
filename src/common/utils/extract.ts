export class Extract { 
    private source: string;
    constructor(text: string){
        this.source = text;
    }   
    onRight(text: string | string[]){
        return this;
    }
    inLine(){
        return this;
    }

    build(){
        return this.source;
    }
}