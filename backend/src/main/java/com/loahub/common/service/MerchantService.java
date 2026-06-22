package com.loahub.common.service;

import com.loahub.common.dao.CommonDao;
import com.loahub.common.dto.ApiResponse;
import com.loahub.common.security.SecurityUtils;
import org.springframework.stereotype.Service;

@Service
public class MerchantService {
    private final CommonDao dao;

    public MerchantService(CommonDao dao) {
        this.dao = dao;
    }

    public ApiResponse<Object> getMerchants() {
        return ApiResponse.ok(dao.findMerchants());
    }

    public ApiResponse<Object> getFavorites() {
        SecurityUtils.requireCurrentUser();
        return ApiResponse.ok(dao.findMerchants());
    }

    public ApiResponse<Object> favorite(long id) {
        SecurityUtils.requireCurrentUser();
        return ApiResponse.ok("즐겨찾기가 반영되었습니다.", dao.findMerchants());
    }

    public ApiResponse<Object> unfavorite(long id) {
        SecurityUtils.requireCurrentUser();
        return ApiResponse.ok("즐겨찾기가 해제되었습니다.", dao.findMerchants());
    }
}
