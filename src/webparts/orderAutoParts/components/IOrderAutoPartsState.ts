
import { Dropdown, DropdownMenuItemType, IDropdownStyles, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
export interface IOrderAutoPartsState{
    orderItems: IDropdownOption[];
    customerItems: IDropdownOption[];
    productItems: IDropdownOption[];
    customerId:string;
    productId:string;
    productType: string;
    date: Date;
    unitPrice: string;
    noOfUnits: string;
    saleValue: string; 
    hideOrderId :boolean;
}