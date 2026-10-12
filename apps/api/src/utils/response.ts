interface ResponseConfig{
    statusCode:number,
    responseObj?:{message?:string,response?:any},
    errorObj?:any
}

export class responseHanlder{
    public statusCode:number;
    public responseObj:any;
    public errorObj:any
    constructor(
        {statusCode,responseObj,errorObj}:ResponseConfig
    ){
        this.statusCode = statusCode
        this.responseObj=responseObj
        this.errorObj=errorObj
    }
}