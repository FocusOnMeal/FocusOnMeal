package com.fom.boot.common.pagination;

public class Pagination {
	public static PageInfo getPageInfo(int currentPage, int totalCount) {
		
		int naviLimit = 10;
		int boardLimit = 5;
		
		
		int maxPage = (int)Math.ceil((double)totalCount/boardLimit);
		int startNavi = (currentPage - 1)/naviLimit*naviLimit + 1;
		int endNavi = startNavi + naviLimit - 1;
		
		if(endNavi > maxPage) {
			endNavi = maxPage;
		}
		
		int startRow = (currentPage - 1) * boardLimit + 1;
	    int endRow = startRow + boardLimit - 1;
		
		return new PageInfo(currentPage, totalCount, naviLimit, maxPage, startNavi, endNavi, boardLimit, startRow, endRow);
	}
}
