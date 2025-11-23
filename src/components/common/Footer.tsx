import { Glasses } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Glasses className="h-5 w-5 text-primary" />
              <span className="font-bold text-lg text-foreground">AI眼镜组件平台</span>
            </div>
            <p className="text-sm text-muted-foreground">
              专为蓝牙智能AI眼镜用户打造的组件发布与分享平台
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">快速链接</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>组件库</p>
              <p>AI工具</p>
              <p>开发文档</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">关于我们</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>提供优质的AI眼镜组件</p>
              <p>支持开发者社区</p>
              <p>推动智能眼镜生态发展</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>{currentYear} AI眼镜组件平台</p>
        </div>
      </div>
    </footer>
  );
}

