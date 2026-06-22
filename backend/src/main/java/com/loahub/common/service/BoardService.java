package com.loahub.common.service;

import com.loahub.common.dao.CommonDao;
import com.loahub.common.dto.ApiResponse;
import org.springframework.stereotype.Service;

@Service
public class BoardService {
    private final CommonDao dao;

    public BoardService(CommonDao dao) {
        this.dao = dao;
    }

    public ApiResponse<Object> getBoards() {
        return ApiResponse.ok(dao.findBoards());
    }
}
