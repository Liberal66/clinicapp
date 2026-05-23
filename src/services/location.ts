import { Geolocation } from '@capacitor/geolocation';

export interface LocationResult {
  latitude: number;
  longitude: number;
  address: string;
  clinicName?: string;
  nearbyClinics?: NearbyClinic[];
}

export interface NearbyClinic {
  name: string;
  address: string;
  distance: number; // 米
  latitude: number;
  longitude: number;
}

// 获取当前位置
export const getCurrentPosition = async (): Promise<LocationResult> => {
  const permission = await Geolocation.requestPermissions();

  if (permission.location !== 'granted') {
    throw new Error('需要位置权限才能获取地址');
  }

  const position = await Geolocation.getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 10000,
  });

  const { latitude, longitude } = position.coords;

  try {
    // 同时获取逆地理编码和周边POI
    const [reverseResult, nearbyClinics] = await Promise.all([
      reverseGeocode(latitude, longitude),
      searchNearbyClinics(latitude, longitude),
    ]);

    return {
      latitude,
      longitude,
      address: reverseResult.address,
      clinicName: nearbyClinics.length > 0 ? nearbyClinics[0].name : undefined,
      nearbyClinics,
    };
  } catch (error) {
    console.warn('获取位置信息失败:', error);
    return {
      latitude,
      longitude,
      address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
    };
  }
};

// 逆地理编码
const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<{ address: string }> => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
    {
      headers: {
        'User-Agent': 'ClinicApp/1.0',
      },
    }
  );

  if (!response.ok) {
    throw new Error('逆地理编码失败');
  }

  const data = await response.json();
  return { address: data.display_name || `${latitude}, ${longitude}` };
};

// 搜索周边诊所/医院
const searchNearbyClinics = async (
  latitude: number,
  longitude: number
): Promise<NearbyClinic[]> => {
  // 搜索关键词：诊所、医院、卫生室等
  const keywords = ['诊所', '医院', '卫生室', '医务室', '门诊部'];
  const clinics: NearbyClinic[] = [];

  for (const keyword of keywords) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          keyword
        )}&lat=${latitude}&lon=${longitude}&radius=1000&limit=5`,
        {
          headers: {
            'User-Agent': 'ClinicApp/1.0',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        for (const item of data) {
          const distance = calculateDistance(
            latitude,
            longitude,
            parseFloat(item.lat),
            parseFloat(item.lon)
          );
          clinics.push({
            name: item.display_name.split(',')[0], // 提取名称
            address: item.display_name,
            distance,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
          });
        }
      }
    } catch (error) {
      console.warn(`搜索${keyword}失败:`, error);
    }
  }

  // 去重并按距离排序
  const uniqueClinics = removeDuplicates(clinics);
  return uniqueClinics.sort((a, b) => a.distance - b.distance).slice(0, 5);
};

// 计算两点间距离（米）
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000; // 地球半径（米）
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

// 去除重复诊所
const removeDuplicates = (clinics: NearbyClinic[]): NearbyClinic[] => {
  const seen = new Set<string>();
  return clinics.filter((clinic) => {
    const key = `${clinic.name}_${Math.round(clinic.latitude * 1000)}_${Math.round(
      clinic.longitude * 1000
    )}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// 格式化地址显示
export const formatAddress = (address: string): string => {
  if (!address) return '';
  if (address.length > 50) {
    return address.substring(0, 50) + '...';
  }
  return address;
};

// 格式化距离显示
export const formatDistance = (distance: number): string => {
  if (distance < 100) {
    return `${distance}米`;
  } else if (distance < 1000) {
    return `${Math.round(distance / 10) * 10}米`;
  } else {
    return `${(distance / 1000).toFixed(1)}公里`;
  }
};
