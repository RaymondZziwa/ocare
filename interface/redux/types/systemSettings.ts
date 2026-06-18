import type { IEmployee } from "./hr";

export interface IBranch {
    id: string;
    name: string;
    location: string;
    updatedAt: Date;
    createdAt: Date;
}

export interface IRole {
    id: string;
    name: string;
    Employee?: IEmployee[];
    permissions: string[];
}

export interface IPermission {
    id: string;
    name: string;
    value: string;
    module: string;
}