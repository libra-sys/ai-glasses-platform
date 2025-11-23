import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
} from "react";

type MapContextProps = {
address?: string;
};

const MapContext = createContext<MapContextProps | null>(null);

const defaultOption = {
zoom: 15,
lng: 116.404,
lat: 39.915,
address: "Chang'an Street, Dongcheng District, Beijing",
};

const loadScript = (src: string) => {
return new Promise<void>((ok, fail) => {
    const script = document.createElement("script");
    script.onerror = (reason) => fail(reason);

    if (~src.indexOf("{{callback}}")) {
    const callbackFn = `loadscriptcallback_${(+new Date()).toString(36)}`;
    (window as any)[callbackFn] = () => {
        ok();
        delete (window as any)[callbackFn];
    };
    src = src.replace("{{callback}}", callbackFn);
    } else {
    script.onload = () => ok();
    }

    script.src = src;
    document.head.appendChild(script);
});
};

const useMap = () => {
const context = useContext(MapContext);

if (!context) {
    return {};
}

return context;
};

const MapTitle = ({ className }: React.ComponentProps<"div">) => {
const { address } = useMap();
if (!address) return null;
return <span className={`text-lg font-bold ${className}`}>{address}</span>;
};

let BMapGLLoadingPromise: Promise<void> | null = null;

const Map = ({
ak,
option,
className,
children,
...props
}: React.ComponentProps<"div"> & {
ak: string;
option?: {
    zoom: number;
    lng: number;
    lat: number;
    address: string;
};
}) => {
const mapRef = useRef<HTMLDivElement>(null);
const currentRef = useRef(null);

const _options = useMemo(() => {
    return { ...defaultOption, ...option };
}, [option]);

const contextValue = useMemo<MapContextProps>(
    () => ({
    address: option?.address,
    }),
    [option?.address]
);

const initMap = useCallback(() => {
    if (!mapRef.current) return;

    let map: any = currentRef.current;

    if (!map) {
    map = new (window as any).BMapGL.Map(mapRef.current);
    currentRef.current = map;
    }

    map.clearOverlays();

    const center = new (window as any).BMapGL.Point(
    _options?.lng,
    _options?.lat
    );

    map.centerAndZoom(center, _options?.zoom);

    const marker = new (window as any).BMapGL.Marker(center);
    map.addOverlay(marker);
}, [_options]);

useEffect(() => {
    if ((window as any).BMapGL) {
    initMap();
    } else if (BMapGLLoadingPromise) {
    BMapGLLoadingPromise.then(initMap).then(() => {
        BMapGLLoadingPromise = null;
    });
    } else {
    BMapGLLoadingPromise = loadScript(
        `//api.map.baidu.com/api?type=webgl&v=1.0&ak=${ak}&callback={{callback}}`
    );

    BMapGLLoadingPromise.then(initMap).then(() => {
        BMapGLLoadingPromise = null;
    });
    }
}, [ak, initMap]);

useEffect(() => {
    return () => {
    if (currentRef.current) {
        currentRef.current = null;
    }
    };
}, []);

return (
    <MapContext.Provider value={contextValue}>
    <div
        ref={mapRef}
        className={`w-full aspect-[16/9] ${className}`}
        {...props}
    ></div>
    {children}
    </MapContext.Provider>
);
};

export { Map, MapTitle };