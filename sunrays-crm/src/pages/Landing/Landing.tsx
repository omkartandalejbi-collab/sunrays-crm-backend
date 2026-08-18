import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, BarChart3, Users, Zap, Shield } from 'lucide-react';
import { Button, buttonVariants } from '../../components/ui/button';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-24 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Sunrays Logo" className="h-20 w-20 object-contain rounded-md" />
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#workflow" className="hover:text-foreground transition-colors">Workflow</a>
            <a href="#stats" className="hover:text-foreground transition-colors">Statistics</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login" className={buttonVariants({ variant: "ghost" }) + " hidden sm:flex"}>
              Login
            </Link>
            <Link to="/login" className={buttonVariants()}>
              Request Demo
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-8 pb-32 lg:pt-12 lg:pb-40">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0" />
          <div className="container relative z-10 mx-auto px-4 text-center sm:px-8">
            <img src="/logo-wide.png" alt="Sunrays Engineering & Solar Tech" className="mx-auto w-full max-w-4xl h-auto mb-8 object-contain" />
            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Manage Every Lead. <br className="hidden sm:block" />
              <span className="text-primary">Track Every Follow-up.</span> <br className="hidden sm:block" />
              Measure Every Conversion.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Sunrays Lead Management Platform helps organizations assign leads, monitor employee performance, manage follow-ups, and improve conversion rates through a centralized enterprise CRM.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/login" className={buttonVariants({ size: "lg" }) + " h-12 px-8 text-base"}>
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                Book a Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to close more deals</h2>
              <p className="mt-4 text-lg text-muted-foreground">Built specifically for high-performing sales teams.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Users, title: 'Lead Assignment', desc: 'Automatically route leads to the right employees based on availability and performance.' },
                { icon: BarChart3, title: 'Real-time Analytics', desc: 'Track conversion rates and employee performance with beautiful, interactive charts.' },
                { icon: Zap, title: 'Automated Follow-ups', desc: 'Never miss a beat with smart reminders and automated follow-up scheduling.' },
                { icon: Shield, title: 'Enterprise Security', desc: 'Role-based access control ensures your lead data stays secure and private.' },
                { icon: CheckCircle, title: 'Status Tracking', desc: 'Monitor the exact stage of every lead in your pipeline at a glance.' },
                { icon: ArrowRight, title: 'Seamless Workflows', desc: 'Designed for speed. Update statuses and log calls in just a few clicks.' },
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-start rounded-2xl border bg-card p-8 shadow-sm transition-soft hover:shadow-soft-hover">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon size={24} />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background py-12">
        <div className="container mx-auto px-4 text-center sm:px-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/logo.jpg" alt="Sunrays Logo" className="h-24 w-24 object-contain rounded-sm" />
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Sunrays Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
