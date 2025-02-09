import { prisma } from "@/lib/prisma";
import { makePaymentSchema } from "../dtos";
import { publicProcedure } from "../trpc";
import { Currency, InvoiceStatus, PaymentMethod } from "@prisma/client";

export const makeInvoicePayment = publicProcedure.input(makePaymentSchema).mutation(async (opts)=>{
    const org = await prisma.organization.findUnique({
        where: {
            id: opts.input.organization_id
        }
    });
    if (!org) {
        throw new Error("Organization not found");
    }
    const account = await prisma.account.findUnique({
        where: {
            id: opts.input.account_id
        }
    });
    if (opts.input.account_id && !account) {
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
});