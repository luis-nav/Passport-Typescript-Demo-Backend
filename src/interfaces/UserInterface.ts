export interface UserInterface {
    username: string;
    id: string;
    isAdmin: boolean
}

export interface DatabaseUserInterface {
    username: string;
    password: string;
    isAdmin: boolean;
    _id: string;
}