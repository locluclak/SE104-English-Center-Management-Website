// import MainApiRequest from "@/redux/apis/MainApiRequest";
// import { Button, DatePicker, Divider, Form, Input, Modal, Select, Table } from "antd";
// import { useEffect, useState } from "react";

// const SelectProduct = ({ products, visible, onOk, onCancel }: { products: any[], visible: boolean, onOk: (product: any) => void, onCancel: () => void }) => {
//     return (
//         <Modal
//             open={visible}
//             onCancel={onCancel}
//             // onOk={() => onOk(selectedProduct)}
//             okButtonProps={{ hidden: true }}
//             title="Select Product"
//             className="modal-overlay"
//             width={800}
//         >
//             <Table
//                 dataSource={products}
//                 columns={[
//                     {
//                         title: "Name",
//                         dataIndex: "product",
//                         render: (product: any) => product.name,
//                     },
//                     {
//                         title: "Manufacturer",
//                         dataIndex: "product",
//                         render: (product: any) => product.partner.name,
//                     },
//                     {
//                         title: "In Stock",
//                         dataIndex: "amount",
//                         key: "amount",
//                     },
//                     {
//                         title: "Type",
//                         dataIndex: "product",
//                         render: (product: any) => product.type,
//                     },
//                     {
//                         title: "Unit",
//                         dataIndex: "product",
//                         render: (product: any) => product.unit,
//                     },
//                     {
//                         title: "Size",
//                         dataIndex: "product",
//                         render: (product: any) => product.size,
//                     },
//                     {
//                         title: "Weight",
//                         dataIndex: "product",
//                         render: (product: any) => product.weight,
//                     },
//                     {
//                         title: "Action",
//                         key: "action",
//                         render: (text: any, record: any) => (
//                             <Button
//                                 onClick={() => onOk(record)}
//                             >
//                                 Select
//                             </Button>
//                         ),
//                     },
//                 ]}
//             />
//         </Modal>
//     );
// }

// const CreateExport = ({
//     visible,
//     setVisible,
//     onOk
// }: {
//     visible: boolean,
//     setVisible: (v: boolean) => void,
//     onOk: (data: any) => void
// }) => {
//     const [form] = Form.useForm();
//     const [items, setItems] = useState<any[]>([]);
//     const [warehouses, setWarehouses] = useState<any[]>([]);
//     const [products, setProducts] = useState<any[]>([]);
//     const [showSelectProduct, setShowSelectProduct] = useState(false);
//     const [isShowAddItemBtn, setIsShowAddItemBtn] = useState(false);

//     // Watch if there's any update on field "warehouse" and "name"
//     const watchWarehouse = Form.useWatch('warehouse', form);

//     useEffect(() => {
//         if (watchWarehouse) {
//             setIsShowAddItemBtn(true);

//             if (items.length) {
//                 setItems([]);
//             }
//         }
//     }, [watchWarehouse]);

//     const handleOK = () => {
//         const data = {
//             warehouseId: form.getFieldValue("warehouse"),
//             name: form.getFieldValue("name"),
//             exportDate: new Date(),
//             status: "DOCUMENT_DRAFT",
//             items: items.map((item) => ({
//                 productId: item.product.product.id,
//                 quantityDocument: item.quantityDocument,
//                 quantityActual: item.quantityActual,
//             })),
//         };
//         onOk(data);
//     }

//     const fetchWarehouses = async () => {
//         const res = await MainApiRequest.get("/warehouses/list");
//         setWarehouses(res.data);
//     }

//     useEffect(() => {
//         if (!warehouses.length) {
//             fetchWarehouses();
//         }
//     }, []);

//     const handleAddNewItem = () => {
//         const selectedWarehouseId = form.getFieldValue("warehouse");
//         if (!selectedWarehouseId) {
//             return;
//         }
//         const warehouse = warehouses.find((warehouse) => warehouse.id === selectedWarehouseId);
//         setProducts(warehouse.products)
//         setShowSelectProduct(true);
//     }

//     return (
//         <Modal
//             open={visible}
//             onCancel={() => setVisible(false)}
//             onOk={() => handleOK()}
//             title="Detail Export"
//             className="modal-overlay"
//             width={800}
//         >
//             <Form form={form}>
//                 <Form.Item
//                     label="Document Name"
//                     name="name"
//                 >
//                     <Input />
//                 </Form.Item>
//                 <Form.Item
//                     label="Warehouse"
//                     name="warehouse"
//                 >
//                     <Select>
//                         {warehouses.map((warehouse: any) => (
//                             <Select.Option key={warehouse.id} value={warehouse.id}>
//                                 {warehouse.name}
//                             </Select.Option>
//                         ))}
//                     </Select>
//                 </Form.Item>
//             </Form>
//             <Divider />
//             {isShowAddItemBtn && (
//                 <>
//                     <Button
//                         onClick={handleAddNewItem}
//                     >
//                         Add Item
//                     </Button>
//                     <SelectProduct
//                         products={products}
//                         visible={showSelectProduct}
//                         onOk={(product) => {
//                             const newItems = [...items];
//                             newItems.push({
//                                 product,
//                                 quantityDocument: 0,
//                                 quantityActual: 0,
//                             });
//                             setItems(newItems);
//                             setShowSelectProduct(false);
//                         }}
//                         onCancel={() => setShowSelectProduct(false)}
//                     />
//                     <Table
//                         dataSource={items}
//                         columns={[
//                             {
//                                 title: "Product Name",
//                                 dataIndex: "product",
//                                 render: (product: any) => product.product.name,
//                             },
//                             {
//                                 title: "Unit Price",
//                                 render: (text: any, record: any) => {
//                                     return record.product.product.unitPrice;
//                                 }
//                             },
//                             {
//                                 title: "Available",
//                                 render: (text: any, record: any) => {
//                                     return record.product.amount;
//                                 }
//                             },
//                             {
//                                 title: "Quantity (Document)",
//                                 render: (text: any, record: any) => {
//                                     return (
//                                         <Input
//                                             type="number"
//                                             value={record.quantityDocument}
//                                             onChange={(e) => {
//                                                 const newItems = [...items];
//                                                 const index = newItems.findIndex((item) => item.product.product.id === record.product.product.id);
//                                                 newItems[index].quantityDocument = e.target.value;
//                                                 setItems(newItems);
//                                             }}
//                                         />
//                                     );
//                                 }
//                             },
//                             {
//                                 title: "Quantity Actual",
//                                 render: (text: any, record: any) => {
//                                     return (
//                                         <Input
//                                             type="number"
//                                             value={record.quantityActual}
//                                             onChange={(e) => {
//                                                 const newItems = [...items];
//                                                 const index = newItems.findIndex((item) => item.product.product.id === record.product.product.id);
//                                                 newItems[index].quantityActual = e.target.value;
//                                                 setItems(newItems);
//                                             }}
//                                         />
//                                     );
//                                 }
//                             },
//                             {
//                                 title: "Total Value",
//                                 render: (text: any, record: any) => {
//                                     return record.product.product.unitPrice * record.quantityActual;
//                                 }
//                             },
//                             {
//                                 title: "Action",
//                                 render: (text: any, record: any) => (
//                                     <Button
//                                         onClick={() => {
//                                             const newItems = [...items];
//                                             const index = newItems.findIndex((item) => item.product.product.id === record.product.product.id);
//                                             newItems.splice(index, 1);
//                                             setItems(newItems);
//                                         }}
//                                     >
//                                         Remove
//                                     </Button>
//                                 )
//                             }
//                         ]}
//                     />
//                 </>
//             )}
//         </Modal>
//     );
// }

// export default CreateExport;