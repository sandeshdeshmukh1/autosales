import * as React from 'react';
import styles from './OrderAutoParts.module.scss';
import { IOrderAutoPartsProps } from './IOrderAutoPartsProps';
import { IOrderAutoPartsState} from './IOrderAutoPartsState';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { escape } from '@microsoft/sp-lodash-subset';
import { sp } from "sp-pnp-js";
import { FontSizes } from '@fluentui/theme';
import { TextField,PrimaryButton } from 'office-ui-fabric-react';
import { IStackTokens, Stack } from 'office-ui-fabric-react/lib/Stack';
import { Dropdown, IDropdownStyles, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { DateTimePicker, DateConvention } from '@pnp/spfx-controls-react/lib/dateTimePicker';
import { mergeStyles } from 'office-ui-fabric-react/lib/Styling';

const iconClass = mergeStyles({
  fontSize: 40,
  height: 40,
  width: 50,
  marginTop:10,
  
  marginLeft:10,
   
});

var customerNames: IDropdownOption[] = [];
var productNames: IDropdownOption[] = [];
var orderItems: IDropdownOption[] = [];

var orderId;
var productName = '';
var customerName = '';

export default class OrderAutoParts extends React.Component<IOrderAutoPartsProps, IOrderAutoPartsState> {
  constructor(props: IOrderAutoPartsProps, state: IOrderAutoPartsState) {
    super(props);
    this.state = {
      hideOrderId: false,
      productItems: [],
      customerItems: [],
      orderItems: [],
      productType: '',
      date: new Date(),
      unitPrice: '',
      noOfUnits: '',
      saleValue: '',
      customerId: '',
      productId: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeCust = this.handleChangeCust.bind(this);
    this.handleChangeOrd = this.handleChangeOrd.bind(this);
    this.autoPopulate = this.autoPopulate.bind(this);
    this.addToOrderList = this.addToOrderList.bind(this);
    this.editOrderList = this.editOrderList.bind(this);
    // this.deleteItem = this.deleteItem.bind(this);
    this.resetOrderList = this.resetOrderList.bind(this);
    this.handleUnitChange = this.handleUnitChange.bind(this);
  }
  private handleChange(event): void {
    productName = event.key;
    this.autoPopulate();
  }
//Getting customer id when customer name is selected
  async handleChangeCust(event): Promise<void> {
    try {
      customerName = event.key;
      let items = await sp.web.lists.getByTitle("Customers").items.getPaged();
      for (let i = 0; i < items.results.length; i++) {
        if (items.results[i].CustomerName == customerName) {
          this.setState({ customerId: items.results[i].CustomerID })
        }
      }
    } catch (error) {
      console.error(error);
    }

  }
//getting order details when id is selected
  async handleChangeOrd(event): Promise<void> {
    try {
      orderId = event.key;
      let items = await sp.web.lists.getByTitle("Orders").items.getPaged();
      for (let i = 0; i < items.results.length; i++) {

        if (items.results[i].OrderID == orderId) {
          this.setState({ productId: items.results[i].ProductID })
          this.setState({ customerId: items.results[i].CustomerID })
          this.setState({ unitPrice: items.results[i].UnitPrice });
          this.setState({ noOfUnits: items.results[i].UnitsSold });
          this.setState({ unitPrice: items.results[i].UnitPrice });
          this.setState({ saleValue: items.results[i].SaleValue });
        }
      }
      let custitems = await sp.web.lists.getByTitle("Customers").items.getPaged();
      for (let i = 0; i < custitems.results.length; i++) {
        debugger
        if (custitems.results[i].CustomerID == this.state.customerId) {
          customerName = custitems.results[i].CustomerName;
        }
      }
      let proditems = await sp.web.lists.getByTitle("Products").items.getPaged();
      for (let i = 0; i < proditems.results.length; i++) {
        if (proditems.results[i].ProductID == this.state.productId) {
          productName = proditems.results[i].ProductName;
          this.setState({ productType: proditems.results[i].ProductType });
          this.setState({ date: new Date(proditems.results[i].ExpiryDate) });
        }
      }
    } catch (error) {
      console.error(error);
    }

  }
//autopopulating fields  when product name is selected
  async autoPopulate(): Promise<void> {
    try {
      let items = await sp.web.lists.getByTitle("Products").items.getPaged();

      for (let i = 0; i < items.results.length; i++) {
        if (items.results[i].ProductName == productName) {
          this.setState({ productId: items.results[i].ProductID })
          this.setState({ productType: items.results[i].ProductType });
          this.setState({ unitPrice: items.results[i].UnitPrice });
          this.setState({ date: new Date(items.results[i].ExpiryDate) });
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  //calculating sales value
  handleUnitChange = (event) => {
    //console.log("handleunitchange Clicked");
    this.setState({ noOfUnits: event.target.value.toString() });
    //console.log(this.state.noOfUnits);
    var units: number = parseInt(event.target.value);
    var unitPrice: number = parseInt(this.state.unitPrice);
    var calculate = units * unitPrice;
    this.setState({ saleValue: calculate.toString() });
    return event;
  }
  //add orders to orders list

  async addToOrderList(event): Promise<void> {
    try {
      debugger
      var unitvalid = this.state.noOfUnits;
      if (customerName == "" || productName == "") {
        alert("Please Select Customer Name From Dropdown" + "\n" + "Please Select Product Name From Dropdown");
      }
      else if (this.state.noOfUnits == "" || this.state.noOfUnits == "0") {
        alert("Please Enter Number Of Units or You have entered zero units");
      }
      else if (Number(unitvalid) !== parseInt(unitvalid) && Number(unitvalid) % 1 !== 0) {
        alert("Please enter No. of Units as integer value")
      }
      else {
        let item = await sp.web.lists.getByTitle("Orders").items.add({
          CustomerID: this.state.customerId,
          ProductID: this.state.productId,
          UnitsSold: this.state.noOfUnits,
          UnitPrice: this.state.unitPrice,
          SaleValue: this.state.saleValue,
          Title: "title"
        });
        alert("Order is added successfully in the list.");
      }
    } catch (error) {
      console.error(error);
    }
  }
  //editing orders
  async editOrderList(event): Promise<void> {
    try {
      this.setState({ hideOrderId: true })
      let list = sp.web.lists.getByTitle("Orders");
      orderId = orderId - 1000;
      const i = await list.items.getById(orderId).update({
        CustomerID: this.state.customerId,
        ProductID: this.state.productId,
        UnitsSold: this.state.noOfUnits,
        UnitPrice: this.state.unitPrice,
        SaleValue: this.state.saleValue,
        Title: "title"
      });
      alert("Order is updated successfully in the list.");
    } catch (error) {
      console.error(error);
    }
  }
//deleting orders
  async deleteItem(event): Promise<void> {
    try {
      this.setState({ hideOrderId: true })
      let list = sp.web.lists.getByTitle("Orders");
      orderId = orderId - 1000;
      await list.items.getById(orderId).delete({});
      alert("Order is deleted successfully from the list.");
    } catch (error) {
      console.error(error);
    }
  }
// resetting fields
  private resetOrderList(): void {
    customerName = '';
    productName = '';
    orderId = '';

    this.setState({
      date: new Date(),
      productType: '',
      unitPrice: '',
      noOfUnits: '',
      saleValue: ''
    })
  }
  //loading data into dropdown choice fields

  public async componentDidMount(): Promise<void> {
    // get all the items from a sharepoint list
    var reacthandler = this;
    sp.web.lists.getByTitle("Customers").items.select('CustomerName').get().then(function (data) {
      for (var k in data) {
        customerNames.push({ key: data[k].CustomerName, text: data[k].CustomerName });
      }
      reacthandler.setState({ customerItems: customerNames });
      console.log(customerNames);
      return customerNames;
    });
    sp.web.lists.getByTitle("Products").items.select('ProductName').get().then(function (data) {
      for (var k in data) {
        productNames.push({ key: data[k].ProductName, text: data[k].ProductName });
      }
      reacthandler.setState({ productItems: productNames });
      console.log(productNames);
      return productNames;
    });
    sp.web.lists.getByTitle("Orders").items.select('OrderID').get().then(function (data) {
      for (var k in data) {
        orderItems.push({ key: data[k].OrderID, text: data[k].OrderID });
      }
      reacthandler.setState({ orderItems: orderItems });
      console.log(orderItems);
      return orderItems;
    });
  }

  public render(): React.ReactElement<IOrderAutoPartsProps> {
    const dropdownStyles: Partial<IDropdownStyles> = {
      dropdown: { width: 452 }
    };
    const stackTokens: IStackTokens = { childrenGap: 35 };
    return (
      <div className={styles.orderAutoParts}>
        <div className={styles.container}>
          <div style={{backgroundColor:"#e3008c"}} className={styles.header}>
            <header >
              {/* <img src={require('./preview.jpg')} alt="logo" width="45" height="40" /> */}
              
              <div  style={{ fontSize: FontSizes.size32 ,display: "flex", justifyContent: "flex-start"}}><FontIcon iconName="TrainSolid" className={iconClass}  />Automobile Order Portal </div>
            </header>
            </div>
          <div className={styles.row}>
            <div className={styles.column}>
            <div  style={{ fontSize: FontSizes.size20 , color:'#000',marginTop:'2rem'}}>
              Welcome Customer, Please Place Your Order
            </div>
            <div style={{ marginTop:'2rem'}}>
            

                <Dropdown required={true}
                  placeholder="Select Customer Name"
                  label="Customer Name"
                  selectedKey={customerName}
                  options={this.state.customerItems}
                  styles={dropdownStyles}
                  onChanged={this.handleChangeCust} />
              
              
                <Dropdown required={true}
                  placeholder="Select Product Name"
                  label="Product Name"
                  selectedKey={productName}
                  options={this.state.productItems}
                  styles={dropdownStyles}
                  onChanged={this.handleChange} />
             
              <TextField required={true}
                placeholder="Product Type"
                label="Product Type"
                value={this.state.productType}
                onChanged={event => {
                  this.setState({ productType: this.state.productType });
                }} />
              <DateTimePicker label="Product Expiry"
                dateConvention={DateConvention.Date}
                value={this.state.date}
                showLabels={false} />
              <TextField required={true}
                placeholder="Product Unit Price"
                label="Product Unit Price"
                type="number"
                value={this.state.unitPrice}
                onChanged={e => { this.setState({ unitPrice: this.state.unitPrice }) }} />
              <TextField required={true}
                placeholder="No. of Units"
                label="Number of units"
                type="number"
                value={this.state.noOfUnits}
                onChange={this.handleUnitChange} />
              <TextField required={true}
                placeholder="Sale Value"
                label="Sale Value"
                type="number"
                value={this.state.saleValue}
                onChanged={e => { this.setState({ saleValue: this.state.saleValue }) }} />
              <Stack tokens={stackTokens}>
                {
                  this.state.hideOrderId ?
                    <Dropdown required={true}
                      placeholder="Select an Order ID to Edit or Delete"
                      label="Order ID"
                      selectedKey={orderId}
                      options={this.state.orderItems}
                      styles={dropdownStyles}
                      onChanged={this.handleChangeOrd} />
                    : null
                }
              </Stack><br></br>
              <Stack horizontal tokens={stackTokens}>
                <PrimaryButton text="ADD" onClick={this.addToOrderList} className={styles.button} allowDisabledFocus />
                <PrimaryButton text="EDIT" onClick={this.editOrderList} className={styles.button} allowDisabledFocus />
                <PrimaryButton text="DELETE" onClick={this.deleteItem} className={styles.button} allowDisabledFocus />
                <PrimaryButton text="RESET" onClick={this.resetOrderList} className={styles.button} allowDisabledFocus />
              </Stack>
              
            </div>
              
             
             



            </div>
          </div>
          <div className={styles.footer} style={{backgroundColor:"#e3008c"}}>
            <footer>
              <section>
                <h3 className={styles.h3} style={{fontSize: FontSizes.size16 }}>Copyright &copy; 2021 Adarsh's Automobile Pvt. Ltd. All Rights Reserved.</h3>
              </section>
            </footer>
          </div>
        </div>
      </div>
    );
  }
}
