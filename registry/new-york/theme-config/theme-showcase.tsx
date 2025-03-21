"use client";

import * as React from "react";
import { themeColors } from "./theme-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ColorBlockProps {
  color: string;
  name: string;
  textColor?: string;
}

const ColorBlock = ({ color, name, textColor = "#ffffff" }: ColorBlockProps) => (
  <div 
    className="p-4 rounded-md flex items-center justify-between" 
    style={{ backgroundColor: color }}
  >
    <span style={{ color: textColor }}>{name}</span>
    <span style={{ color: textColor }}>{color}</span>
  </div>
);

export function ThemeShowcase() {
  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Body Bliss Visio Theme</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Primary Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ColorBlock color={themeColors.primary} name="Primary" />
            <ColorBlock color={themeColors.primaryDark} name="Primary Dark" />
            <ColorBlock color={themeColors.primaryLight} name="Primary Light" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Secondary Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ColorBlock color={themeColors.secondary} name="Secondary" />
            <ColorBlock color={themeColors.secondaryDark} name="Secondary Dark" />
            <ColorBlock color={themeColors.secondaryLight} name="Secondary Light" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Accent Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ColorBlock color={themeColors.accent} name="Accent" />
            <ColorBlock color={themeColors.accentDark} name="Accent Dark" />
            <ColorBlock color={themeColors.accentLight} name="Accent Light" />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>State Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ColorBlock color={themeColors.success} name="Success" />
            <ColorBlock color={themeColors.warning} name="Warning" />
            <ColorBlock color={themeColors.error} name="Error" />
            <ColorBlock color={themeColors.info} name="Info" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Background Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ColorBlock 
              color={themeColors.background.main} 
              name="Main" 
              textColor={themeColors.text.primary} 
            />
            <ColorBlock 
              color={themeColors.background.alt} 
              name="Alt" 
              textColor={themeColors.text.primary} 
            />
            <ColorBlock 
              color={themeColors.background.card} 
              name="Card" 
              textColor={themeColors.text.primary} 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Text Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ColorBlock 
              color={themeColors.text.primary} 
              name="Primary" 
              textColor={themeColors.background.main} 
            />
            <ColorBlock 
              color={themeColors.text.secondary} 
              name="Secondary" 
              textColor={themeColors.background.main} 
            />
            <ColorBlock 
              color={themeColors.text.disabled} 
              name="Disabled" 
              textColor={themeColors.background.main} 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Border Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ColorBlock 
              color={themeColors.border.light} 
              name="Light" 
              textColor={themeColors.text.primary} 
            />
            <ColorBlock 
              color={themeColors.border.medium} 
              name="Medium" 
              textColor={themeColors.text.primary} 
            />
            <ColorBlock 
              color={themeColors.border.dark} 
              name="Dark" 
              textColor={themeColors.text.light} 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 