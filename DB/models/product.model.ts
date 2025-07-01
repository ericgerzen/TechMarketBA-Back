export interface Product {
    id_product: number;
    name: string;
    description: string;
    category: string;
    model: string;
    condition: string;
    approved: boolean;
    id_user: number;
    price: number;
    // Removed 'picture' property since images are now in a separate table
}

export interface Image {
    id_image: number;
    link: string;
    id_product: number;
}
