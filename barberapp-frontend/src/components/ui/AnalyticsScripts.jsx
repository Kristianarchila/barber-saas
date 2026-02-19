import { useEffect } from 'react';

/**
 * AnalyticsScripts - Inyecta scripts de seguimiento si están configurados
 */
export const AnalyticsScripts = ({ barberia }) => {
    useEffect(() => {
        if (!barberia?.configuracion) return;

        const { analyticsId, pixelId } = barberia.configuracion;

        // 1. Google Analytics
        if (analyticsId && !document.getElementById('ga-script')) {
            const gaScript = document.createElement('script');
            gaScript.id = 'ga-script';
            gaScript.async = true;
            gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
            document.head.appendChild(gaScript);

            const gaInit = document.createElement('script');
            gaInit.id = 'ga-init';
            gaInit.innerHTML = `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${analyticsId}');
            `;
            document.head.appendChild(gaInit);
        }

        // 2. Facebook Pixel
        if (pixelId && !document.getElementById('fb-pixel')) {
            const fbInit = document.createElement('script');
            fbInit.id = 'fb-pixel';
            fbInit.innerHTML = `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${pixelId}');
                fbq('track', 'PageView');
            `;
            document.head.appendChild(fbInit);
        }
    }, [barberia]);

    return null;
};
