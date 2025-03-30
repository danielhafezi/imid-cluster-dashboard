import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { BadgeCheck, LayoutDashboard, Users, Activity, Pill, FileText } from "lucide-react"

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-4xl text-primary">IMID Cluster Dashboard</CardTitle>
          <CardDescription className="text-xl">
            Immune-Mediated Inflammatory Disease Patient Insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            This dashboard provides interactive visualization of patient clusters for Rheumatoid Arthritis 
            and Lupus cases, with AI-powered insights on patient characteristics.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/patients/dashboard">
                View Dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/patients">
                Browse Patients
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-primary">
              <Users className="mr-2 h-5 w-5" />
              Patient Directory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Browse and search patient records with detailed information.</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/patients">
                View Patients →
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-primary">
              <LayoutDashboard className="mr-2 h-5 w-5" />
              Patient Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">View interactive patient cluster visualization with AI-generated insights.</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/patients/dashboard">
                Open Dashboard →
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-primary">
              <Activity className="mr-2 h-5 w-5" />
              Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Explore conditions and their distribution across patient clusters.</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/conditions">
                View Conditions →
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-primary">
              <Pill className="mr-2 h-5 w-5" />
              Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">View medications and treatment patterns across different patient groups.</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/medications">
                View Medications →
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-primary">
              <BadgeCheck className="mr-2 h-5 w-5 text-green-500" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <p className="text-muted-foreground">Database: Connected</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <p className="text-muted-foreground">AI Services: Available</p>
              </div>
              <p className="text-muted-foreground text-sm mt-2">Last update: {new Date().toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-primary">
              <FileText className="mr-2 h-5 w-5 text-blue-500" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2">
              This is a prototype application demonstrating visualization of IMID patient clusters.
            </p>
            <p className="text-muted-foreground text-sm">
              Research purposes only. Data is synthetic and not representative of real patients.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 