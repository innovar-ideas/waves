import { prisma } from "@/lib/prisma";
import { billPaymentSchema, createBillPaymentSchema, findByIdSchema, makePaymentSchema } from "../dtos";
import { publicProcedure } from "../trpc";
import { BillStatus, Currency, InvoiceStatus, PaymentMethod, AccountItemStatus, PaymentStatus } from "@prisma/client";
import { PaymentTableType } from "../types";


export const makeInvoicePayment = publicProcedure.input(makePaymentSchema).mutation(async (opts)=>{
  
    const org = await prisma.organization.findUnique({
        where: {
            id: opts.input.organization_id
        }
    });
  
    if (!org) {
        console.log("Organization not found");
        throw new Error("Organization not found");
    }

    if(opts.input.account_id){
        console.log("4 Account ID provided");
        const account = await prisma.accounts.findUnique({
            where: {
                id: opts.input.account_id
            }
        });
      
        if (!account) {
            throw new Error("Account not found");
        }
    

        if(!opts?.input?.list_of_invoices){
            throw new Error("Please provide at least one invoice to make payment");
        }
        

        const newPayments = await prisma.payment.create({
            data: {
                amount: opts.input.pay_amount || 0,
                payment_date: opts.input.payment_date || new Date(),
                payment_method: opts.input.pay_method as PaymentMethod || null,
                status: PaymentStatus.COMPLETED,
                account_id: opts.input.account_id || null,
                organization_id: opts.input.organization_id || "",
                client_id: opts.input.client_id || null,
                currency: opts.input.currency as Currency || null,
                remaining_amount: opts.input.pay_amount || 0,
            }
        });
     

        for(const invoice_id of opts?.input?.list_of_invoices){
            const invoice = await prisma.invoice.update({
                where: {
                    id: invoice_id

                },
                data: {
                    status: InvoiceStatus.PAID
                }
    
            });
            if(invoice && invoice.id){
                console.log("13 Invoice found");

                await prisma.invoicePayment.create({
                    data: {


                        invoice_id: invoice.id,
                        payment_id: newPayments.id,
                        payment_date: opts.input.payment_date || new Date(),
                        payment_method: opts.input.pay_method as PaymentMethod || null,
                        amount: invoice.amount,
                        created_at: new Date(),
                        deleted_at: null,
                    }
                });
            }
            else{
                console.log("15 Invoice not found");
            }

        }


return {
    message: "Payment made successfully",
    payment_id: newPayments.id
};
    }
    
    
    if(!opts?.input?.list_of_invoices){
        throw new Error("Please provide at least one invoice to make payment");
    }



    const newPayments = await prisma.payment.create({
        data: {
            amount: opts.input.pay_amount || 0,
            payment_date: opts.input.payment_date || new Date(),
            payment_method: opts.input.pay_method as PaymentMethod || null,
            organization_id: opts.input.organization_id || "",
            client_id: opts.input.client_id || null,
            currency: opts.input.currency as Currency || null,
            remaining_amount: opts.input.pay_amount || 0,
           
        }
    });


    for(const invoice_id of opts?.input?.list_of_invoices){
        const invoice = await prisma.invoice.update({
            where: {

                id: invoice_id
            },
            data: {
                status: InvoiceStatus.PAID
            }

        });
        if(invoice && invoice.id){
            
            await prisma.invoicePayment.create({
                data: {

                    invoice_id: invoice.id,
                    payment_id: newPayments.id,
                    payment_date: opts.input.payment_date || new Date(),
                    payment_method: opts.input.pay_method as PaymentMethod || null,
                    amount: invoice.amount,
                    created_at: new Date(),
                    deleted_at: null,
                }
            });
        }
        }
        
    
    
    
    return {
        message: "Payment made successfully",
        payment_id: newPayments.id
    };
});

export const getAllPaymentsByOrganization = publicProcedure.input(findByIdSchema).query(async (opts) => {
    const payments = await prisma.payment.findMany({
        where: {
            organization_id: opts.input.id
        },
        select: {
            id: true,
            amount: true,
            payment_date: true,
            payment_method: true,
            currency: true,
            remaining_amount: true,
            invoice_id: true,
            bill_id: true,
            invoice: {
                select: {
                    id: true,
                    amount: true,
                    status: true
                }
            },
            bill: {
                select: {
                    id: true,
                    amount: true,
                    status: true
                }
            },
            account: {
                select: {
                    id: true,
                    account_name: true,
                    account_number: true,
                    bank_name: true,
                    bank_branch: true,
                }
            },
            client: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    phone: true,
                }
            },
            vendor: {
                select: {
                    id: true,
                    name: true,
                    phone_number: true,
                    email: true,
                }
            }
        }
    });

    return payments.map(payment => ({
        payments: payment,
        invoice: payment.invoice || undefined,
        bill: payment.bill || undefined,
        account: payment.account || undefined,
        client: payment.client || undefined,
        vendor: payment.vendor || undefined
    })) as unknown as PaymentTableType[];
    
});



export const makeBillPayment = publicProcedure.input(billPaymentSchema).mutation(async (opts) => {
   

    const org = await prisma.organization.findUnique({
        where: {
            slug: opts.input.organization_slug
        }
    });

    if (!org) {
        throw new Error("Organization not found");
    }
    
  

    const newPayment = await prisma.payment.create({
        data: {
            amount: opts.input.amount,
            payment_date: new Date(),
            payment_method: opts.input.payment_method as PaymentMethod || null,
            organization_id: org.id,
            account_id: opts.input.account_id,
            currency: opts.input.currency as Currency || null,
            remaining_amount: opts.input.amount,
            vendor_id: opts.input.vendor_id,
            reference: opts.input.reference,
        }
    });
    let count = 0;
    let paidAmount = opts.input.amount;
    if(opts.input.line_items){
        
        for(const bill_item of opts.input.line_items){
            count++;
            const accountItem = await prisma.accountItem.findUnique({
                where: {
                    id: bill_item.id
                }
            });
            
            if (!accountItem) continue;  
            
            if (paidAmount >= accountItem.amount) {
                await prisma.accountItem.update({
                    where: {
                        id: bill_item.id
                    },
                    data: {
                        status: AccountItemStatus.PAID
                    }
                });
                paidAmount -= accountItem.amount;
            } else {
                await prisma.accountItem.update({
                    where: {
                        id: bill_item.id
                    },
                    data: {
                        status: AccountItemStatus.PENDING
                    }
                });
            }


            
        }
    }
   const bill = await prisma.bill.findUnique({
    where: {
        id: opts.input.bill_id
    },
    include: {
        account_items: true
    }
   });
   
   
    if(count === bill?.account_items.length){
        await prisma.bill.update({
            where: {
                id: opts.input.bill_id
            },
            data: {
                status: BillStatus.PAID
            }
        });
    }else{
        await prisma.bill.update({
            where: {
                id: opts.input.bill_id
            },
            data: {
                status: BillStatus.PARTIALLY_PAID
            }
        });
    }

    return {
        message: "Bill payment made successfully",
        payment_id: newPayment.id
    };
});


export const getAllNotPaidBillsByVendorId = publicProcedure.input(findByIdSchema).query(async (opts) => {
    const bills = await prisma.bill.findMany({
        where: {
            status: {
                in: [BillStatus.DRAFT,  BillStatus.PARTIALLY_PAID, BillStatus.OVERDUE, BillStatus.PENDING]
            },
            supplier_id: opts.input.id
        },
        include: {
            account_items: {
                select: {
                    id: true,
                    description: true,
                    quantity: true,
                    price: true,
                    amount: true,
                    date: true,
                    status: true
                }
            }
        }

    });




    return bills;
});

export const createBillPayment = publicProcedure.input(createBillPaymentSchema).mutation(async (opts) => {
    const org = await prisma.organization.findUnique({
        where: {
            id: opts.input.organization_slug
        }
    });

    if (!org) {
        throw new Error("Organization not found");
    }
    const newPayment = await prisma.payment.create({
        data: {
            amount: opts.input.amount,
            payment_date: new Date(),
            payment_method: opts.input.payment_method as PaymentMethod || null,
            organization_id: org.id,
            currency: opts.input.currency as Currency || null,
            remaining_amount: opts.input.amount,
            vendor_id: opts.input.vendor_id,
            reference: opts.input.reference,
            account_id: opts.input.account_id,
        }
    });
    
    for(const bill_id of opts.input.bills){
        await prisma.billPayment.create({
            data: {
                bill_id: bill_id,
                payment_id: newPayment.id,
                payment_date: new Date(),
                payment_method: opts.input.payment_method as PaymentMethod || null,
                amount: opts.input.amount,
            }
        });
        await prisma.bill.update({
            where: {
                id: bill_id
            },
            data: {
                status: BillStatus.PAID,
            }
        });
    }

    return {
        message: "Bill payment created successfully",
        payment_id: newPayment.id
    };
});

export const getAllPaymentsInvoice = publicProcedure.input(findByIdSchema).query(async (opts) => {
    const payments = await prisma.payment.findMany({
        where: {
            organization_id: opts.input.id,
            invoice_id: {not: null},
            client_id: {not: null},
            payment_method: {
                in: [PaymentMethod.CASH, PaymentMethod.CHEQUE],
            }, 
            status: { not: PaymentStatus.DEPOSITED }
        },
        include: {invoice: true, account: true, client: true}
    });

    return payments;
    
});
