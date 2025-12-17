import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Need to create Card
import { Package, DollarSign, Users, Activity } from "lucide-react";

// Mock Stats
const stats = [
    {
        title: "Total Revenue",
        value: "₹45,231.89",
        change: "+20.1% from last month",
        icon: DollarSign,
    },
    {
        title: "Active Products",
        value: "+2350",
        change: "+180 new products",
        icon: Package,
    },
    {
        title: "Active Customers",
        value: "+12,234",
        change: "+19% from last month",
        icon: Users,
    },
    {
        title: "Low Stock Items",
        value: "12",
        change: "Requires attention",
        icon: Activity,
    },
];

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Overview of your store&apos;s performance.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stat.change}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Recent Activity or Charts could go here */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            You made 265 sales this month.
                        </p>
                        {/* Placeholder for list */}
                        <div className="mt-4 space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-9 w-9 rounded-full bg-muted" />
                                        <div>
                                            <p className="text-sm font-medium">Olivia Martin</p>
                                            <p className="text-xs text-muted-foreground">olivia.martin@email.com</p>
                                        </div>
                                    </div>
                                    <div className="font-medium">+₹1,999.00</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Top Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Placeholder for list */}
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded bg-muted" />
                                        <div>
                                            <p className="text-sm font-medium">Cotton Shirt</p>
                                            <p className="text-xs text-muted-foreground">In Stock</p>
                                        </div>
                                    </div>
                                    <div className="font-medium">₹49.99</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
